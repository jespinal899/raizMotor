-- Inmobiliarias: cada cuenta con un plan de inmobiliaria tiene su perfil público (nombre comercial, logo,
-- contacto y una dirección propia en el sitio), que sale en sus anuncios y proyectos. El equipo verifica los
-- perfiles que revisó, y esa marca se pierde sola si la inmobiliaria cambia de nombre.
--
-- Necesita antes: 20261017000000_proyectos_de_inmobiliarias.sql (el límite de proyectos que dice quién tiene
-- un plan de inmobiliaria) y 20261018000000_moderar_proyectos.sql (el registro de moderación con proyectos).
-- Se aplica con `supabase db push` o en el panel de Supabase: SQL Editor > New query > pegar todo > Run.
--
-- Es idempotente: ejecutarla otra vez deja exactamente lo mismo. No cambia ningún anuncio, proyecto ni perfil:
-- las inmobiliarias que ya existen empiezan sin perfil y lo crean desde «Mi inmobiliaria».

do $$
begin
  if to_regprocedure('public.admin_set_account_limits(uuid, integer, integer, text)') is null then
    raise exception 'Falta aplicar antes la migración 20261017000000_proyectos_de_inmobiliarias.sql';
  end if;
  if to_regprocedure('public.admin_set_project_status(uuid, text, text)') is null then
    raise exception 'Falta aplicar antes la migración 20261018000000_moderar_proyectos.sql';
  end if;
end;
$$;

-- Una por cuenta: la de la cuenta que la administra.
create table if not exists public.agencies (
  owner_id uuid primary key references auth.users (id) on delete cascade,
  -- Lo que va en su dirección del sitio: /inmobiliaria/<slug>. Minúsculas, números y guiones.
  slug text not null unique check (char_length(slug) between 3 and 60 and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  kind text not null default 'inmobiliaria' check (kind in ('inmobiliaria', 'constructora')),
  name text not null check (char_length(btrim(name)) between 2 and 100),
  description text not null default '' check (char_length(description) <= 1000),
  -- Ruta dentro del depósito `agency-logos`, siempre en la carpeta de su cuenta; sin valor si no subió uno.
  logo text,
  -- Completo y sin separadores, como el de los perfiles: +50499999999.
  phone text not null default '' check (phone = '' or phone ~ '^\+[0-9]{8,15}$'),
  email text not null default '' check (email = '' or (char_length(email) <= 254 and email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$')),
  website text not null default '' check (website = '' or (char_length(website) <= 200 and website ~ '^https://')),
  facebook text not null default '' check (facebook = '' or (char_length(facebook) <= 200 and facebook ~ '^https://')),
  instagram text not null default '' check (instagram = '' or (char_length(instagram) <= 200 and instagram ~ '^https://')),
  city text not null default '' check (char_length(city) <= 100),
  -- Lo marca el equipo después de revisar sus datos. La inmobiliaria no puede marcarlo.
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.agencies enable row level security;

revoke all on public.agencies from anon, authenticated;
grant select on public.agencies to anon, authenticated;
grant insert, update, delete on public.agencies to authenticated;

-- Si una cuenta tiene un plan de inmobiliaria: puede tener algún proyecto publicado. Lo lee quien no puede leer
-- los perfiles, así que no entrega nada más.
create or replace function public.has_agency_plan(account uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select max_projects > 0 from public.profiles where id = account), false)
$$;

revoke execute on function public.has_agency_plan(uuid) from public;
grant execute on function public.has_agency_plan(uuid) to anon, authenticated;

-- Cualquiera ve el perfil de una inmobiliaria con su plan activo. Si el plan se retira, el perfil deja de
-- verse en el sitio, pero no se borra: vuelve tal cual si se activa otra vez.
drop policy if exists "Cualquiera ve las inmobiliarias con plan" on public.agencies;
create policy "Cualquiera ve las inmobiliarias con plan" on public.agencies
  for select to anon, authenticated
  using (public.has_agency_plan(owner_id));

-- La propia inmobiliaria y el equipo la ven siempre.
drop policy if exists "Cada inmobiliaria ve su perfil" on public.agencies;
create policy "Cada inmobiliaria ve su perfil" on public.agencies
  for select to authenticated
  using (owner_id = (select auth.uid()) or (select public.is_admin()));

drop policy if exists "Cada inmobiliaria crea su perfil" on public.agencies;
create policy "Cada inmobiliaria crea su perfil" on public.agencies
  for insert to authenticated
  with check (owner_id = (select auth.uid()) or (select public.is_admin()));

drop policy if exists "Cada inmobiliaria edita su perfil" on public.agencies;
create policy "Cada inmobiliaria edita su perfil" on public.agencies
  for update to authenticated
  using (owner_id = (select auth.uid()) or (select public.is_admin()))
  with check (owner_id = (select auth.uid()) or (select public.is_admin()));

drop policy if exists "Cada inmobiliaria borra su perfil" on public.agencies;
create policy "Cada inmobiliaria borra su perfil" on public.agencies
  for delete to authenticated
  using (owner_id = (select auth.uid()) or (select public.is_admin()));

-- Antes de guardar un perfil: lo que lo identifica no cambia, solo lo crea una cuenta con plan de inmobiliaria,
-- su logo está en su propia carpeta y la verificación solo la da el equipo. El equipo (con su sesión o desde el
-- panel de Supabase) guarda lo que escriba.
create or replace function public.prepare_agency()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  author uuid := (select auth.uid());
begin
  new.name := btrim(new.name);
  new.updated_at := now();

  if tg_op = 'UPDATE' then
    new.owner_id := old.owner_id;
    new.created_at := old.created_at;
  else
    new.created_at := now();
  end if;

  if author is null or public.is_admin() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    -- El sitio reconoce este código y explica que hace falta un plan de inmobiliaria.
    if not public.has_agency_plan(new.owner_id) then
      raise exception 'agency_plan_required' using errcode = 'RZ006';
    end if;
    new.verified := false;
  elsif new.name is distinct from old.name then
    -- Otro nombre es otra marca: el equipo tiene que volver a revisarla.
    new.verified := false;
  else
    new.verified := old.verified;
  end if;

  if new.logo is not null and new.logo not like new.owner_id::text || '/%' then
    raise exception 'invalid_logo' using errcode = 'RZ002';
  end if;

  return new;
end;
$$;

create or replace trigger prepare_agency_before_write
  before insert or update on public.agencies
  for each row execute function public.prepare_agency();

-- Marcar una inmobiliaria como verificada, o quitarle la marca. Queda en el registro de moderación.
create or replace function public.admin_set_agency_verified(target_agency uuid, new_verified boolean, review_note text default '')
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.require_admin();

  update public.agencies set verified = new_verified where owner_id = target_agency;
  if not found then
    raise exception 'agency_not_found' using errcode = 'RZ003';
  end if;

  insert into public.moderation_log (actor_id, action, account_id, note)
  values (
    (select auth.uid()),
    case when new_verified then 'verify_agency' else 'unverify_agency' end,
    target_agency,
    left(btrim(coalesce(review_note, '')), 500)
  );
end;
$$;

revoke execute on function public.admin_set_agency_verified(uuid, boolean, text) from public, anon;
grant execute on function public.admin_set_agency_verified(uuid, boolean, text) to authenticated;

-- Los logos: se ven sin iniciar sesión, pesan poco (el sitio los reduce antes de subirlos) y cada cuenta
-- gestiona solo los de su carpeta.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('agency-logos', 'agency-logos', true, 524288, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Logos: cada cuenta ve los suyos" on storage.objects;
create policy "Logos: cada cuenta ve los suyos" on storage.objects
  for select to authenticated
  using (bucket_id = 'agency-logos' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "Logos: cada cuenta con plan de inmobiliaria sube los suyos" on storage.objects;
create policy "Logos: cada cuenta con plan de inmobiliaria sube los suyos" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'agency-logos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and public.has_agency_plan((select auth.uid()))
  );

drop policy if exists "Logos: cada cuenta reemplaza los suyos" on storage.objects;
create policy "Logos: cada cuenta reemplaza los suyos" on storage.objects
  for update to authenticated
  using (bucket_id = 'agency-logos' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'agency-logos' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "Logos: cada cuenta borra los suyos" on storage.objects;
create policy "Logos: cada cuenta borra los suyos" on storage.objects
  for delete to authenticated
  using (bucket_id = 'agency-logos' and (storage.foldername(name))[1] = (select auth.uid())::text);
