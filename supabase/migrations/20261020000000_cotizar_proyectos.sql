-- Cotizar un proyecto: quien ve un proyecto, con o sin sesión, deja su nombre, su correo, su teléfono y el
-- modelo que le interesa, y la función `contact-publisher` (supabase/functions) se los envía por correo a la
-- cuenta de la inmobiliaria. Igual que el contacto por un anuncio (20261013000000_contacto_al_publicador.sql).
--
-- Necesita antes: 20261013000000_contacto_al_publicador.sql y 20261016000000_proyectos.sql.
-- Se aplica con `supabase db push` o en el panel de Supabase: SQL Editor > New query > pegar todo > Run.
--
-- Es idempotente: ejecutarla otra vez deja exactamente lo mismo. No cambia ningún proyecto ni ningún contacto.
--
-- Los datos de quien escribe no se guardan: viajan en el correo y nada más. Aquí queda solo qué envío se hizo y
-- sobre qué proyecto, para que un reintento no mande dos correos, y los límites:
--   5 contactos por hora desde una misma IP, sumando anuncios y proyectos (se guarda su huella, nunca la IP),
--   20 contactos por hora sobre un mismo proyecto.

do $$
begin
  if to_regclass('public.publisher_contacts') is null then
    raise exception 'Falta aplicar antes la migración 20261013000000_contacto_al_publicador.sql';
  end if;
  if to_regclass('public.projects') is null then
    raise exception 'Falta aplicar antes la migración 20261016000000_proyectos.sql';
  end if;
end;
$$;

-- Un envío es por un anuncio o por un proyecto, nunca por los dos.
alter table public.publisher_contacts
  add column if not exists project_id uuid references public.projects (id) on delete cascade;
alter table public.publisher_contacts alter column property_id drop not null;
alter table public.publisher_contacts drop constraint if exists publisher_contacts_one_subject;
alter table public.publisher_contacts
  add constraint publisher_contacts_one_subject check (num_nonnulls(property_id, project_id) = 1);

-- Reserva un envío por un proyecto antes de mandar el correo: comprueba que está publicado, aplica los límites
-- y entrega a quién escribirle (el correo de la cuenta dueña del proyecto) y cómo saludarla (su desarrolladora).
-- Si la clave ya se usó, dice `already_sent`. Solo la llama `contact-publisher`, con la clave de servicio: el
-- correo de la inmobiliaria nunca llega al navegador. Para liberar la reserva sirve `release_publisher_contact`.
create or replace function public.claim_project_contact(target_project uuid, contact_key text, sender_fingerprint text)
returns table (outcome text, owner_email text, publisher_name text, project_name text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  found_owner uuid;
  found_name text;
  found_developer text;
  found_email text;
begin
  if contact_key is null or contact_key !~ '^[A-Za-z0-9_-]{1,64}$' then
    raise exception 'invalid_contact' using errcode = 'RZ002';
  end if;

  if exists (select 1 from public.publisher_contacts c where c.operation_key = contact_key) then
    return query select 'already_sent'::text, null::text, null::text, null::text;
    return;
  end if;

  select p.owner_id, p.name, p.developer_name
  into found_owner, found_name, found_developer
  from public.projects p
  where p.id = target_project and p.status = 'published';

  if found_owner is not null then
    select u.email into found_email from auth.users u where u.id = found_owner;
  end if;

  if found_email is null then
    raise exception 'project_not_found' using errcode = 'RZ003';
  end if;

  if not public.take_rate_limit('publisher_contact_sender', coalesce(sender_fingerprint, 'unknown'), 5, interval '1 hour') then
    raise exception 'too_many_contacts' using errcode = 'RZ004';
  end if;
  if not public.take_rate_limit('project_contact_project', target_project::text, 20, interval '1 hour') then
    raise exception 'too_many_contacts' using errcode = 'RZ004';
  end if;

  insert into public.publisher_contacts (operation_key, project_id)
  values (contact_key, target_project)
  on conflict do nothing;

  return query select 'claimed'::text, found_email::text, found_developer, found_name;
end;
$$;

revoke execute on function public.claim_project_contact(uuid, text, text) from public, anon, authenticated;
grant execute on function public.claim_project_contact(uuid, text, text) to service_role;
