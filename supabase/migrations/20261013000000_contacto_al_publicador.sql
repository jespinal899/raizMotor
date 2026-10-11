-- Contacto al publicador: quien ve un anuncio, con o sin sesión, deja su nombre, su correo y su teléfono, y la
-- función `contact-publisher` (supabase/functions) se los envía por correo a quien lo publicó.
--
-- Necesita antes: 20261009000100_anuncios.sql y 20261012000000_limites_de_uso.sql.
-- Se aplica con `supabase db push` o en el panel de Supabase: SQL Editor > New query > pegar todo > Run.
--
-- Es idempotente: ejecutarla otra vez deja exactamente lo mismo. No cambia ningún anuncio ni ningún perfil.
--
-- Los datos de quien escribe no se guardan: viajan en el correo y nada más. Aquí queda solo qué envío se hizo
-- y sobre qué anuncio, para que un reintento o un doble clic no mande dos correos, y los límites:
--   5 contactos por hora desde una misma IP (se guarda su huella, nunca la IP),
--   20 contactos por hora sobre un mismo anuncio.

do $$
begin
  if to_regclass('public.properties') is null then
    raise exception 'Falta aplicar antes la migración 20261009000100_anuncios.sql';
  end if;
  if to_regprocedure('public.take_rate_limit(text, text, integer, interval)') is null then
    raise exception 'Falta aplicar antes la migración 20261012000000_limites_de_uso.sql';
  end if;
end;
$$;

-- Cada contacto enviado, por la clave del envío. Sin nombre, correo ni teléfono de quien escribió.
create table if not exists public.publisher_contacts (
  operation_key text primary key,
  property_id uuid not null references public.properties (id) on delete cascade,
  sent_at timestamptz not null default now()
);

alter table public.publisher_contacts enable row level security;

revoke all on public.publisher_contacts from anon, authenticated;

-- Reserva un envío antes de mandar el correo: comprueba que el anuncio está publicado, aplica los límites y
-- entrega a quién escribirle. Si la clave ya se usó, dice `already_sent` y no hay que mandar nada. Solo la
-- llama la función `contact-publisher`, con la clave de servicio: el correo del publicador nunca llega al
-- navegador.
create or replace function public.claim_publisher_contact(target_property uuid, contact_key text, sender_fingerprint text)
returns table (outcome text, owner_email text, publisher_name text, property_title text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  found_owner uuid;
  found_title text;
  found_name text;
  found_email text;
begin
  if contact_key is null or contact_key !~ '^[A-Za-z0-9_-]{1,64}$' then
    raise exception 'invalid_contact' using errcode = 'RZ002';
  end if;

  if exists (select 1 from public.publisher_contacts c where c.operation_key = contact_key) then
    return query select 'already_sent'::text, null::text, null::text, null::text;
    return;
  end if;

  select p.owner_id, p.title, p.advertiser_name
  into found_owner, found_title, found_name
  from public.properties p
  where p.id = target_property and p.status = 'published';

  if found_owner is not null then
    select u.email into found_email from auth.users u where u.id = found_owner;
  end if;

  if found_email is null then
    raise exception 'property_not_found' using errcode = 'RZ003';
  end if;

  if not public.take_rate_limit('publisher_contact_sender', coalesce(sender_fingerprint, 'unknown'), 5, interval '1 hour') then
    raise exception 'too_many_contacts' using errcode = 'RZ004';
  end if;
  if not public.take_rate_limit('publisher_contact_property', target_property::text, 20, interval '1 hour') then
    raise exception 'too_many_contacts' using errcode = 'RZ004';
  end if;

  insert into public.publisher_contacts (operation_key, property_id)
  values (contact_key, target_property)
  on conflict do nothing;

  return query select 'claimed'::text, found_email::text, found_name, found_title;
end;
$$;

-- Si el correo no salió, se libera la clave: así el reintento con la misma clave sí lo envía.
create or replace function public.release_publisher_contact(contact_key text)
returns void
language sql
security definer
set search_path = ''
as $$
  delete from public.publisher_contacts where operation_key = contact_key
$$;

revoke execute on function
  public.claim_publisher_contact(uuid, text, text),
  public.release_publisher_contact(text)
from public, anon, authenticated;

grant execute on function
  public.claim_publisher_contact(uuid, text, text),
  public.release_publisher_contact(text)
to service_role;
