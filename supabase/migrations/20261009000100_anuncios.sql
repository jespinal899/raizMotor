-- Anuncios: la tabla, quién puede leerlos, publicarlos y eliminarlos, y lo que el servidor fija al guardarlos.
--
-- Necesita antes: 20261009000000_perfiles.sql.
-- Se aplica en el panel de Supabase: SQL Editor > New query > pegar todo > Run.
--
-- Es idempotente: ejecutarla otra vez, con la base vacía o ya con anuncios, deja exactamente lo mismo. No
-- borra ni cambia ningún anuncio ni su estado. Lo que declara (la función, el disparador y los permisos)
-- queda siempre como dice este archivo.
--
-- Las escrituras que hace el sitio también lo son: repetir una publicación con su misma clave no crea otro
-- anuncio ni da error, y borrar dos veces el mismo anuncio no hace nada la segunda vez.

-- Sin los perfiles no habría de dónde sacar el límite de anuncios ni el nombre del anunciante: se avisa
-- aquí, en lugar de dejar una tabla que fallaría al publicar.
do $$
begin
  if to_regclass('public.profiles') is null then
    raise exception 'Falta aplicar antes la migración 20261009000000_perfiles.sql';
  end if;
end;
$$;

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  -- Identifica la operación de publicar: repetirla, por un reintento o un doble envío, no crea otro anuncio.
  -- El sitio guarda con `on conflict (owner_id, operation_key) do nothing`, así que la repetición no hace nada.
  operation_key text not null,
  -- `hidden` retira un anuncio del catálogo sin borrarlo: se cambia a mano en Table Editor > properties.
  status text not null default 'published' check (status in ('published', 'hidden')),
  title text not null check (char_length(title) between 1 and 80),
  description text not null check (char_length(description) between 1 and 2000),
  type text not null check (type in ('casa', 'apartamento', 'terreno')),
  operation text not null check (operation in ('venta', 'alquiler')),
  -- En dólares; mensual cuando la operación es alquiler.
  price numeric not null check (price > 0),
  department text not null,
  city text not null,
  neighborhood text not null,
  address text not null,
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  -- En metros cuadrados. Lo que no aplica al tipo de propiedad queda sin valor.
  built_area numeric check (built_area > 0),
  land_area numeric check (land_area > 0),
  bedrooms integer check (bedrooms >= 0),
  bathrooms integer check (bathrooms >= 0),
  parking integer check (parking >= 0),
  features text[] not null default '{}',
  -- Rutas de las fotos dentro del depósito `property-photos`; la primera es la portada.
  photos text[] not null check (cardinality(photos) between 1 and 10),
  -- Los copia el servidor del perfil de quien publica: el sitio no puede escribir otros.
  advertiser_name text not null default '',
  advertiser_phone text not null default '',
  created_at timestamptz not null default now(),
  unique (owner_id, operation_key)
);

create index if not exists properties_catalog_idx on public.properties (created_at desc) where status = 'published';

alter table public.properties enable row level security;

grant select on public.properties to anon, authenticated;
grant insert, delete on public.properties to authenticated;

-- El catálogo es público. Un anuncio oculto solo lo sigue viendo quien lo publicó.
drop policy if exists "Cualquiera ve los anuncios publicados" on public.properties;
create policy "Cualquiera ve los anuncios publicados" on public.properties
  for select to anon, authenticated
  using (status = 'published' or owner_id = (select auth.uid()));

drop policy if exists "Cada cuenta publica sus anuncios" on public.properties;
create policy "Cada cuenta publica sus anuncios" on public.properties
  for insert to authenticated
  with check (owner_id = (select auth.uid()));

drop policy if exists "Cada cuenta elimina sus anuncios" on public.properties;
create policy "Cada cuenta elimina sus anuncios" on public.properties
  for delete to authenticated
  using (owner_id = (select auth.uid()));

-- Antes de guardar un anuncio: se fija de quién es, se comprueba el límite de su cuenta y se copian del
-- perfil el nombre y el teléfono con los que se le contactará.
create or replace function public.prepare_property()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  owner public.profiles;
begin
  -- Nadie publica en nombre de otra cuenta ni elige el estado de su anuncio.
  new.owner_id := auth.uid();
  new.status := 'published';

  select * into owner from public.profiles where id = new.owner_id;

  -- Reintentar un anuncio ya guardado no cuenta como otro: no gasta el límite, y la restricción de unicidad
  -- hace que la repetición no guarde nada.
  if not exists (
    select 1 from public.properties
    where owner_id = new.owner_id and operation_key = new.operation_key
  ) and (
    select count(*) from public.properties where owner_id = new.owner_id
  ) >= coalesce(owner.max_publications, 1) then
    -- El sitio reconoce este código y explica que el plan no admite más anuncios.
    raise exception 'publication_limit_reached' using errcode = 'RZ001';
  end if;

  new.advertiser_name := trim(coalesce(owner.first_name, '') || ' ' || coalesce(owner.last_name, ''));
  new.advertiser_phone := coalesce(owner.phone, '');

  return new;
end;
$$;

create or replace trigger prepare_property_before_insert
  before insert on public.properties
  for each row execute function public.prepare_property();
