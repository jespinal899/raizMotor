-- Proyectos: desarrollos que una inmobiliaria vende antes de terminarlos (en planos, en construcción o casi
-- listos), cada uno con sus modelos de unidad. Por ahora los carga el equipo del sitio (Table Editor >
-- projects y project_models, y sus fotos en Storage > project-photos); el sitio solo los muestra.
--
-- Necesita antes: 20261009000000_perfiles.sql, 20261011000000_busqueda_en_el_servidor.sql y
-- 20261011000100_moderacion.sql.
-- Se aplica con `supabase db push` o en el panel de Supabase: SQL Editor > New query > pegar todo > Run.
--
-- Es idempotente: ejecutarla otra vez deja exactamente lo mismo. No borra ni cambia ningún proyecto. Lo que
-- declara (tablas, permisos, función y depósito) queda siempre como dice este archivo.

do $$
begin
  if to_regclass('public.profiles') is null then
    raise exception 'Falta aplicar antes la migración 20261009000000_perfiles.sql';
  end if;
  if to_regprocedure('public.search_text(text)') is null then
    raise exception 'Falta aplicar antes la migración 20261011000000_busqueda_en_el_servidor.sql';
  end if;
  if to_regprocedure('public.is_admin()') is null then
    raise exception 'Falta aplicar antes la migración 20261011000100_moderacion.sql';
  end if;
end;
$$;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  -- La cuenta de la inmobiliaria: con un plan de pago, sus proyectos se destacan en la portada.
  owner_id uuid not null references auth.users (id) on delete cascade,
  -- `draft` lo prepara el equipo sin mostrarlo; `hidden` lo retira del catálogo sin borrarlo.
  status text not null default 'draft' check (status in ('draft', 'published', 'hidden')),
  name text not null check (char_length(name) between 3 and 100),
  -- Quién lo construye y vende, y el teléfono al que se le escribe (completo: +50499999999).
  developer_name text not null check (char_length(developer_name) between 2 and 100),
  developer_phone text not null default '' check (developer_phone = '' or developer_phone ~ '^\+[0-9]{8,15}$'),
  description text not null check (char_length(description) between 20 and 4000),
  kind text not null check (kind in ('residencial', 'torre', 'condominio', 'lotificacion')),
  -- En planos (preventa), en obra, o terminado y listo para entregar.
  stage text not null check (stage in ('preventa', 'construccion', 'entrega_inmediata')),
  -- Fecha estimada de entrega; sin valor si no se ha anunciado.
  delivery_date date,
  -- En dólares: el precio de la unidad más barata.
  price_from numeric not null check (price_from > 0),
  units_total integer check (units_total > 0),
  department text not null,
  city text not null,
  neighborhood text not null,
  address text not null,
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  amenities text[] not null default '{}',
  -- Rutas dentro del depósito `project-photos`, o direcciones https completas; la primera es la portada.
  photos text[] not null check (cardinality(photos) between 1 and 20),
  video_url text check (video_url is null or video_url ~ '^https://'),
  created_at timestamptz not null default now(),
  search_place text generated always as (public.search_text(neighborhood || ' ' || city)) stored
);

create index if not exists projects_catalog_idx on public.projects (created_at desc) where status = 'published';
create index if not exists projects_owner_idx on public.projects (owner_id);

-- Los modelos de unidad de cada proyecto: «Modelo A, 2 cuartos, 85 m², desde $95,000».
create table if not exists public.project_models (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  bedrooms integer check (bedrooms >= 0),
  bathrooms integer check (bathrooms >= 0),
  -- En metros cuadrados.
  area numeric not null check (area > 0),
  -- En dólares.
  price_from numeric not null check (price_from > 0),
  -- Orden en la ficha: de menor a mayor.
  position integer not null default 0
);

create index if not exists project_models_project_idx on public.project_models (project_id, position);

alter table public.projects enable row level security;
alter table public.project_models enable row level security;

revoke all on public.projects, public.project_models from anon, authenticated;
grant select on public.projects, public.project_models to anon, authenticated;
grant insert, update, delete on public.projects, public.project_models to authenticated;

-- Cualquiera ve los proyectos publicados y sus modelos; el equipo ve y gestiona todos.
drop policy if exists "Cualquiera ve los proyectos publicados" on public.projects;
create policy "Cualquiera ve los proyectos publicados" on public.projects
  for select to anon, authenticated
  using (status = 'published');

drop policy if exists "El equipo gestiona los proyectos" on public.projects;
create policy "El equipo gestiona los proyectos" on public.projects
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "Cualquiera ve los modelos de los proyectos publicados" on public.project_models;
create policy "Cualquiera ve los modelos de los proyectos publicados" on public.project_models
  for select to anon, authenticated
  using (exists (select 1 from public.projects p where p.id = project_id and p.status = 'published'));

drop policy if exists "El equipo gestiona los modelos" on public.project_models;
create policy "El equipo gestiona los modelos" on public.project_models
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- Los proyectos destacados de la portada, como mucho `max_count` (entre 0 y 24): los publicados de cuentas
-- con un plan de pago (más de un anuncio a la vez), como mucho 2 por cuenta, en un orden que rota cada hora.
-- La misma regla que `featured_properties`. Lee los perfiles con los permisos de su dueño, pero solo entrega
-- proyectos publicados, que cualquiera ya puede ver.
create or replace function public.featured_projects(max_count integer default 6)
returns setof public.projects
language sql
stable
security definer
set search_path = ''
as $$
  with per_account as (
    select
      p.id,
      md5(p.id::text || date_trunc('hour', now())::text) as turn,
      row_number() over (
        partition by p.owner_id order by md5(p.id::text || date_trunc('hour', now())::text)
      ) as position
    from public.projects p
    join public.profiles owner on owner.id = p.owner_id
    where p.status = 'published'
      and owner.max_publications > 1
  )
  select p.*
  from per_account chosen
  join public.projects p on p.id = chosen.id
  where chosen.position <= 2
  order by chosen.turn
  limit least(greatest(coalesce(max_count, 6), 0), 24)
$$;

revoke execute on function public.featured_projects(integer) from public;
grant execute on function public.featured_projects(integer) to anon, authenticated;

-- Fotos de los proyectos: se ven sin iniciar sesión, y solo el equipo las sube, cambia o borra.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('project-photos', 'project-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Fotos de proyectos: el equipo las gestiona" on storage.objects;
create policy "Fotos de proyectos: el equipo las gestiona" on storage.objects
  for all to authenticated
  using (bucket_id = 'project-photos' and (select public.is_admin()))
  with check (bucket_id = 'project-photos' and (select public.is_admin()));
