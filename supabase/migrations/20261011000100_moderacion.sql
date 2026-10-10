-- Moderación: cuentas del equipo con permisos de administración, reportes de anuncios que llegan de verdad
-- y un registro de cada decisión que toma el equipo.
--
-- Necesita antes: 20261009000000_perfiles.sql, 20261009000100_anuncios.sql y 20261010000000_integridad_de_anuncios.sql.
-- Se aplica con `supabase db push` o en el panel de Supabase: SQL Editor > New query > pegar todo > Run.
--
-- Es idempotente: ejecutarla otra vez deja exactamente lo mismo. No cambia ningún anuncio ni ningún perfil:
-- todas las cuentas quedan como `user`. La primera cuenta del equipo se nombra a mano (ver
-- supabase/migrations/README.md).
--
-- Todo lo que hace el equipo pasa por funciones que comprueban primero que quien llama es del equipo. Las
-- tablas nuevas no admiten escrituras directas desde el sitio.

do $$
begin
  if to_regclass('public.profiles') is null then
    raise exception 'Falta aplicar antes la migración 20261009000000_perfiles.sql';
  end if;
  if to_regclass('public.properties') is null then
    raise exception 'Falta aplicar antes la migración 20261009000100_anuncios.sql';
  end if;
  if to_regprocedure('public.validate_property()') is null then
    raise exception 'Falta aplicar antes la migración 20261010000000_integridad_de_anuncios.sql';
  end if;
end;
$$;

-- El papel de cada cuenta: `user` publica sus anuncios; `admin` es del equipo del sitio. El sitio no puede
-- escribir en `profiles`, así que nadie se da a sí mismo el papel de administración.
alter table public.profiles add column if not exists role text not null default 'user';

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('user', 'admin'));

-- Si quien llama es del equipo. La usan las políticas y las funciones de administración, y el sitio, para
-- mostrar el panel solo a quien puede usarlo.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select role = 'admin' from public.profiles where id = (select auth.uid())), false)
$$;

revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- Detiene la operación si quien llama no es del equipo.
create or replace function public.require_admin()
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;
end;
$$;

revoke execute on function public.require_admin() from public, anon, authenticated;

-- El equipo ve todos los anuncios, también los despublicados y los ocultos, para revisarlos.
drop policy if exists "El equipo ve todos los anuncios" on public.properties;
create policy "El equipo ve todos los anuncios" on public.properties
  for select to authenticated
  using ((select public.is_admin()));

-- Antes de guardar un cambio. Es la función de 20261010000000_integridad_de_anuncios.sql con un cambio: las
-- reglas de estado y del plan son para quien publica, no para el equipo. Quien es del equipo oculta un
-- anuncio o lo devuelve al catálogo, aunque su dueño ya no tenga lugar en el plan.
create or replace function public.keep_property_consistent()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  owner public.profiles;
begin
  -- De quién es el anuncio, con qué clave se publicó y cuándo no cambian nunca.
  new.id := old.id;
  new.owner_id := old.owner_id;
  new.operation_key := old.operation_key;
  new.created_at := old.created_at;

  select * into owner from public.profiles where id = new.owner_id;

  -- Con su sesión del sitio, quien publicó el anuncio solo lo pasa de publicado a despublicado y al revés.
  -- Lo que el equipo ocultó sigue oculto, y nadie oculta por su cuenta: eso lo hace el equipo.
  if (select auth.uid()) is not null and not public.is_admin() then
    if old.status = 'hidden' or new.status not in ('published', 'unpublished') then
      new.status := old.status;
    end if;

    -- Volver a publicar ocupa un lugar del plan, igual que publicar un anuncio nuevo.
    if new.status = 'published' and old.status <> 'published' then
      perform pg_advisory_xact_lock(hashtextextended('properties:' || new.owner_id::text, 0));

      if (
        select count(*) from public.properties where owner_id = new.owner_id and status = 'published'
      ) >= coalesce(owner.max_publications, 1) then
        raise exception 'publication_limit_reached' using errcode = 'RZ001';
      end if;
    end if;
  end if;

  -- El anunciante nunca lo escribe el sitio: sale siempre del perfil de la cuenta.
  new.advertiser_name := trim(coalesce(owner.first_name, '') || ' ' || coalesce(owner.last_name, ''));
  new.advertiser_phone := coalesce(owner.phone, '');

  new.updated_at := now();

  return new;
end;
$$;

-- Los reportes de anuncios. Los envía cualquiera desde la ficha, con o sin sesión, a través de
-- `report_property`; solo el equipo los lee.
create table if not exists public.property_reports (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  -- Quién lo envió, si tenía la sesión abierta.
  reporter_id uuid references auth.users (id) on delete set null,
  -- Identifica el envío: repetirlo, por un reintento o un doble clic, no crea otro reporte.
  operation_key text not null unique,
  reason text not null check (reason in ('misleading', 'fraud', 'outdated', 'inappropriate', 'other')),
  details text not null default '' check (char_length(details) <= 500),
  -- `open` espera revisión; `resolved` llevó a una medida; `dismissed` se revisó y no hacía falta ninguna.
  status text not null default 'open' check (status in ('open', 'resolved', 'dismissed')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users (id) on delete set null
);

create index if not exists property_reports_open_idx on public.property_reports (created_at desc) where status = 'open';
create index if not exists property_reports_property_idx on public.property_reports (property_id);

alter table public.property_reports enable row level security;

revoke all on public.property_reports from anon, authenticated;
grant select on public.property_reports to authenticated;

drop policy if exists "El equipo lee los reportes" on public.property_reports;
create policy "El equipo lee los reportes" on public.property_reports
  for select to authenticated
  using ((select public.is_admin()));

-- Cada decisión del equipo, con quién la tomó y cuándo. Los identificadores no son claves foráneas: el
-- registro sobrevive aunque se elimine el anuncio o la cuenta.
create table if not exists public.moderation_log (
  id bigint generated always as identity primary key,
  actor_id uuid,
  action text not null,
  property_id uuid,
  account_id uuid,
  report_id uuid,
  note text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists moderation_log_created_idx on public.moderation_log (created_at desc);

alter table public.moderation_log enable row level security;

revoke all on public.moderation_log from anon, authenticated;
grant select on public.moderation_log to authenticated;

drop policy if exists "El equipo lee el registro de moderación" on public.moderation_log;
create policy "El equipo lee el registro de moderación" on public.moderation_log
  for select to authenticated
  using ((select public.is_admin()));

-- Reportar un anuncio publicado. Lo usa la ficha, con o sin sesión. Es idempotente por la clave del envío.
-- Para que nadie inunde al equipo: una cuenta envía como mucho 10 reportes por hora, y un mismo anuncio
-- recibe como mucho 30 por hora; después se pide esperar (RZ004), nunca se descarta en silencio.
create or replace function public.report_property(
  target_property uuid,
  report_reason text,
  report_details text,
  report_key text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  reporter uuid := (select auth.uid());
  cleaned text := btrim(coalesce(report_details, ''));
begin
  if exists (select 1 from public.property_reports where operation_key = report_key) then
    return;
  end if;

  if report_key !~ '^[A-Za-z0-9_-]{1,64}$'
    or report_reason not in ('misleading', 'fraud', 'outdated', 'inappropriate', 'other')
    or char_length(cleaned) > 500
    or (report_reason = 'other' and cleaned = '') then
    raise exception 'invalid_report' using errcode = 'RZ002';
  end if;

  if not exists (select 1 from public.properties where id = target_property and status = 'published') then
    raise exception 'property_not_found' using errcode = 'RZ003';
  end if;

  if (
    reporter is not null and (
      select count(*) from public.property_reports
      where reporter_id = reporter and created_at > now() - interval '1 hour'
    ) >= 10
  ) or (
    select count(*) from public.property_reports
    where property_id = target_property and created_at > now() - interval '1 hour'
  ) >= 30 then
    raise exception 'too_many_reports' using errcode = 'RZ004';
  end if;

  insert into public.property_reports (property_id, reporter_id, operation_key, reason, details)
  values (target_property, reporter, report_key, report_reason, cleaned)
  on conflict (operation_key) do nothing;
end;
$$;

revoke execute on function public.report_property(uuid, text, text, text) from public;
grant execute on function public.report_property(uuid, text, text, text) to anon, authenticated;

-- Revisar un reporte. `hide_property` oculta el anuncio y da por resueltos todos sus reportes pendientes;
-- `resolve` lo da por resuelto sin tocar el anuncio; `dismiss` lo descarta.
create or replace function public.admin_review_report(target_report uuid, decision text, review_note text default '')
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  reported uuid;
  reviewer uuid := (select auth.uid());
begin
  perform public.require_admin();

  select property_id into reported from public.property_reports where id = target_report;
  if reported is null then
    raise exception 'report_not_found' using errcode = 'RZ003';
  end if;

  if decision = 'hide_property' then
    update public.properties set status = 'hidden' where id = reported;
    update public.property_reports
    set status = 'resolved', reviewed_at = now(), reviewed_by = reviewer
    where property_id = reported and (status = 'open' or id = target_report);
  elsif decision in ('resolve', 'dismiss') then
    update public.property_reports
    set
      status = case decision when 'resolve' then 'resolved' else 'dismissed' end,
      reviewed_at = now(),
      reviewed_by = reviewer
    where id = target_report;
  else
    raise exception 'invalid_decision' using errcode = 'RZ002';
  end if;

  insert into public.moderation_log (actor_id, action, property_id, report_id, note)
  values (reviewer, 'report_' || decision, reported, target_report, left(btrim(coalesce(review_note, '')), 500));
end;
$$;

-- Ocultar un anuncio, o devolver al catálogo uno que ocultó el equipo. Lo que despublicó su dueño no lo
-- vuelve a publicar el equipo: es decisión de quien lo publicó.
create or replace function public.admin_set_property_status(target_property uuid, new_status text, review_note text default '')
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_status text;
begin
  perform public.require_admin();

  select status into current_status from public.properties where id = target_property;
  if current_status is null then
    raise exception 'property_not_found' using errcode = 'RZ003';
  end if;

  if new_status not in ('published', 'hidden') or (new_status = 'published' and current_status <> 'hidden') then
    raise exception 'invalid_status' using errcode = 'RZ002';
  end if;

  update public.properties set status = new_status where id = target_property;

  insert into public.moderation_log (actor_id, action, property_id, note)
  values (
    (select auth.uid()),
    case new_status when 'hidden' then 'hide_property' else 'restore_property' end,
    target_property,
    left(btrim(coalesce(review_note, '')), 500)
  );
end;
$$;

-- Cuántos anuncios puede tener publicados a la vez una cuenta: lo que se sube al contratar un plan.
create or replace function public.admin_set_publication_limit(target_account uuid, new_limit integer, review_note text default '')
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.require_admin();

  if new_limit is null or new_limit not between 0 and 1000 then
    raise exception 'invalid_limit' using errcode = 'RZ002';
  end if;

  update public.profiles set max_publications = new_limit where id = target_account;
  if not found then
    raise exception 'account_not_found' using errcode = 'RZ003';
  end if;

  insert into public.moderation_log (actor_id, action, account_id, note)
  values ((select auth.uid()), 'set_publication_limit:' || new_limit, target_account, left(btrim(coalesce(review_note, '')), 500));
end;
$$;

-- Las cuentas, con su correo y cuántos anuncios tienen publicados, de la más reciente a la más antigua.
-- `search` busca en el correo y en el nombre. `total_count` es el total de cuentas que cumplen la búsqueda.
create or replace function public.admin_list_accounts(search text default '', page_offset integer default 0, page_limit integer default 20)
returns table (
  id uuid,
  email text,
  first_name text,
  last_name text,
  phone text,
  max_publications integer,
  role text,
  created_at timestamptz,
  published_count bigint,
  total_count bigint
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  pattern text := '%' || btrim(coalesce(search, '')) || '%';
begin
  perform public.require_admin();

  return query
    select
      p.id,
      u.email::text,
      p.first_name,
      p.last_name,
      p.phone,
      p.max_publications,
      p.role,
      p.created_at,
      (select count(*) from public.properties pr where pr.owner_id = p.id and pr.status = 'published'),
      count(*) over ()
    from public.profiles p
    join auth.users u on u.id = p.id
    where u.email ilike pattern or (p.first_name || ' ' || p.last_name) ilike pattern
    order by p.created_at desc, p.id
    offset greatest(coalesce(page_offset, 0), 0)
    limit least(greatest(coalesce(page_limit, 20), 1), 100);
end;
$$;

revoke execute on function
  public.admin_review_report(uuid, text, text),
  public.admin_set_property_status(uuid, text, text),
  public.admin_set_publication_limit(uuid, integer, text),
  public.admin_list_accounts(text, integer, integer)
from public, anon;

grant execute on function
  public.admin_review_report(uuid, text, text),
  public.admin_set_property_status(uuid, text, text),
  public.admin_set_publication_limit(uuid, integer, text),
  public.admin_list_accounts(text, integer, integer)
to authenticated;
