-- Límites de uso: cuántas veces puede repetir una acción una cuenta (o, sin sesión, una IP) en un tiempo, para
-- que nadie abuse del sitio llamando a la API una y otra vez.
--
-- Necesita antes: 20261009000200_fotos_de_anuncios.sql y 20261011000100_moderacion.sql.
-- Se aplica con `supabase db push` o en el panel de Supabase: SQL Editor > New query > pegar todo > Run.
--
-- Es idempotente: ejecutarla otra vez deja exactamente lo mismo. No cambia ningún anuncio, perfil ni foto.
--
-- Los límites, y quién los tiene:
--   Corregir el contenido de un anuncio       30 veces por hora, por cuenta.
--   Despublicar o volver a publicar            20 veces por hora, por cuenta.
--   Subir fotos                                50 cada 2 horas con el plan Propietario; sin límite con un
--                                              plan de pago (más de 1 anuncio a la vez) o siendo del equipo.
--   Reportar un anuncio sin sesión             1 por hora, por IP (los de las cuentas siguen como estaban:
--                                              10 por hora, y 30 por hora sobre un mismo anuncio).
-- Lo que hace el equipo desde el panel no tiene límite. Un intento que no llega a guardarse no cuenta.

do $$
begin
  if to_regprocedure('public.report_property(uuid, text, text, text)') is null then
    raise exception 'Falta aplicar antes la migración 20261011000100_moderacion.sql';
  end if;
  if not exists (select 1 from storage.buckets where id = 'property-photos') then
    raise exception 'Falta aplicar antes la migración 20261009000200_fotos_de_anuncios.sql';
  end if;
end;
$$;

create extension if not exists pgcrypto with schema extensions;

-- Cada uso que cuenta para un límite. `bucket` dice de qué límite es y `subject`, de quién: una cuenta o la
-- huella de una IP (nunca la IP tal cual). Solo la leen y la escriben las funciones de esta migración.
create table if not exists public.rate_limit_hits (
  id bigint generated always as identity primary key,
  bucket text not null,
  subject text not null,
  hit_at timestamptz not null default now()
);

create index if not exists rate_limit_hits_lookup_idx on public.rate_limit_hits (bucket, subject, hit_at);
create index if not exists rate_limit_hits_age_idx on public.rate_limit_hits (hit_at);

alter table public.rate_limit_hits enable row level security;

revoke all on public.rate_limit_hits from anon, authenticated;

-- Anota un uso si cabe en el límite y dice si cabía. Los usos se cuentan de uno en uno por límite y quien,
-- para que dos peticiones a la vez no quepan las dos en el último lugar. Si la operación que lo pidió falla
-- después, el uso se deshace con ella.
create or replace function public.take_rate_limit(limit_bucket text, limit_subject text, max_hits integer, time_window interval)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform pg_advisory_xact_lock(hashtextextended('rate:' || limit_bucket || ':' || limit_subject, 0));

  -- Los usos viejos ya no cuentan. De vez en cuando se barren también los de otros: ningún límite dura un día.
  delete from public.rate_limit_hits
  where bucket = limit_bucket and subject = limit_subject and hit_at <= now() - time_window;
  if random() < 0.01 then
    delete from public.rate_limit_hits where hit_at < now() - interval '1 day';
  end if;

  if (
    select count(*) from public.rate_limit_hits where bucket = limit_bucket and subject = limit_subject
  ) >= max_hits then
    return false;
  end if;

  insert into public.rate_limit_hits (bucket, subject) values (limit_bucket, limit_subject);

  return true;
end;
$$;

revoke execute on function public.take_rate_limit(text, text, integer, interval) from public, anon, authenticated;

-- La IP de quien hace la petición, según las cabeceras que añade Supabase; `null` si no llega ninguna.
-- Primero la que pone Cloudflare, que quien llama no puede falsear.
create or replace function public.request_ip()
returns text
language sql
stable
set search_path = ''
as $$
  with headers as (
    select nullif(current_setting('request.headers', true), '')::json as h
  )
  select nullif(btrim(split_part(coalesce(h ->> 'cf-connecting-ip', h ->> 'x-real-ip', h ->> 'x-forwarded-for', ''), ',', 1)), '')
  from headers
$$;

revoke execute on function public.request_ip() from public, anon, authenticated;

-- Antes de guardar un cambio de un anuncio, con la sesión de su dueño: corregir el contenido y cambiar el
-- estado tienen cada uno su límite. Guardar otra vez lo mismo no cuenta. Corre después de
-- `keep_property_consistent` (van por orden alfabético), así que ve el estado que de verdad se guarda.
create or replace function public.rate_limit_property_changes()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  editor uuid := (select auth.uid());
begin
  if editor is null or public.is_admin() then
    return new;
  end if;

  if (
    new.title, new.description, new.type, new.operation, new.price, new.department, new.city,
    new.neighborhood, new.address, new.latitude, new.longitude, new.built_area, new.land_area,
    new.bedrooms, new.bathrooms, new.parking, new.features, new.photos
  ) is distinct from (
    old.title, old.description, old.type, old.operation, old.price, old.department, old.city,
    old.neighborhood, old.address, old.latitude, old.longitude, old.built_area, old.land_area,
    old.bedrooms, old.bathrooms, old.parking, old.features, old.photos
  ) and not public.take_rate_limit('property_edit', editor::text, 30, interval '1 hour') then
    raise exception 'rate_limited:property_edit' using errcode = 'RZ005';
  end if;

  if new.status is distinct from old.status
    and not public.take_rate_limit('property_status', editor::text, 20, interval '1 hour') then
    raise exception 'rate_limited:property_status' using errcode = 'RZ005';
  end if;

  return new;
end;
$$;

create or replace trigger rate_limit_property_changes_before_update
  before update on public.properties
  for each row execute function public.rate_limit_property_changes();

-- Si la cuenta con la sesión abierta puede subir otra foto. Con un plan de pago (más de un anuncio a la vez)
-- o siendo del equipo, siempre; con el plan Propietario, 50 cada 2 horas.
create or replace function public.can_upload_photo()
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  uploader uuid := (select auth.uid());
  allowed integer;
begin
  if uploader is null then
    return false;
  end if;

  select max_publications into allowed from public.profiles where id = uploader;
  if coalesce(allowed, 1) > 1 or public.is_admin() then
    return true;
  end if;

  if not public.take_rate_limit('photo_upload', uploader::text, 50, interval '2 hours') then
    raise exception 'rate_limited:photo_upload' using errcode = 'RZ005';
  end if;

  return true;
end;
$$;

revoke execute on function public.can_upload_photo() from public, anon;
grant execute on function public.can_upload_photo() to authenticated;

-- La política de subida de 20261009000200_fotos_de_anuncios.sql, con el límite de fotos.
drop policy if exists "Fotos de anuncios: cada cuenta sube las suyas" on storage.objects;
create policy "Fotos de anuncios: cada cuenta sube las suyas" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'property-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and public.can_upload_photo()
  );

-- Reportar un anuncio. Es la función de 20261011000100_moderacion.sql con un cambio: sin sesión, cada IP
-- envía como mucho un reporte por hora. Se guarda la huella de la IP, no la IP.
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
  client_ip text;
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

  if reporter is null then
    client_ip := public.request_ip();
    if client_ip is not null and not public.take_rate_limit(
      'anonymous_report',
      encode(extensions.digest(client_ip, 'sha256'), 'hex'),
      1,
      interval '1 hour'
    ) then
      raise exception 'too_many_reports' using errcode = 'RZ004';
    end if;
  end if;

  insert into public.property_reports (property_id, reporter_id, operation_key, reason, details)
  values (target_property, reporter, report_key, report_reason, cleaned)
  on conflict (operation_key) do nothing;
end;
$$;
