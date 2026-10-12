-- Proyectos de las inmobiliarias: cada cuenta con un plan de inmobiliaria publica, edita, despublica y borra sus
-- propios proyectos, hasta el número que admite su plan (`profiles.max_projects`). El equipo sigue pudiendo
-- cargar, ocultar y gestionar cualquiera.
--
-- Necesita antes: 20261016000000_proyectos.sql y 20261015000000_destacadas_de_pago.sql.
-- Se aplica con `supabase db push` o en el panel de Supabase: SQL Editor > New query > pegar todo > Run.
--
-- Es idempotente: ejecutarla otra vez deja exactamente lo mismo. No cambia ningún proyecto ni el límite de
-- ninguna cuenta: las que ya existen empiezan sin proyectos propios (0).

do $$
begin
  if to_regclass('public.projects') is null then
    raise exception 'Falta aplicar antes la migración 20261016000000_proyectos.sql';
  end if;
  if to_regprocedure('public.featured_properties(integer)') is null then
    raise exception 'Falta aplicar antes la migración 20261015000000_destacadas_de_pago.sql';
  end if;
end;
$$;

-- Cuántos proyectos puede tener publicados a la vez una cuenta: 0 salvo con un plan de inmobiliaria, que el
-- equipo activa desde el panel. Como `max_publications`, el sitio nunca lo escribe.
alter table public.profiles
  add column if not exists max_projects integer not null default 0 check (max_projects between 0 and 1000);

-- Lo que el sitio necesita para guardar un proyecto una sola vez aunque el envío se repita, y para ordenar
-- los de cada cuenta por su último cambio. Los que cargó el equipo no tienen clave.
alter table public.projects add column if not exists operation_key text;
alter table public.projects add column if not exists updated_at timestamptz not null default now();
create unique index if not exists projects_owner_operation_idx on public.projects (owner_id, operation_key);

-- Las inmobiliarias gestionan sus propios proyectos. El equipo los sigue gestionando todos con su política.
drop policy if exists "Cada cuenta ve sus proyectos" on public.projects;
create policy "Cada cuenta ve sus proyectos" on public.projects
  for select to authenticated
  using (owner_id = (select auth.uid()));

drop policy if exists "Cada inmobiliaria crea sus proyectos" on public.projects;
create policy "Cada inmobiliaria crea sus proyectos" on public.projects
  for insert to authenticated
  with check (owner_id = (select auth.uid()));

drop policy if exists "Cada inmobiliaria edita sus proyectos" on public.projects;
create policy "Cada inmobiliaria edita sus proyectos" on public.projects
  for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

drop policy if exists "Cada inmobiliaria borra sus proyectos" on public.projects;
create policy "Cada inmobiliaria borra sus proyectos" on public.projects
  for delete to authenticated
  using (owner_id = (select auth.uid()));

-- Los modelos de un proyecto los gestiona quien gestiona el proyecto.
drop policy if exists "Cada inmobiliaria gestiona los modelos de sus proyectos" on public.project_models;
create policy "Cada inmobiliaria gestiona los modelos de sus proyectos" on public.project_models
  for all to authenticated
  using (exists (select 1 from public.projects p where p.id = project_id and p.owner_id = (select auth.uid())))
  with check (exists (select 1 from public.projects p where p.id = project_id and p.owner_id = (select auth.uid())));

-- Si quien guarda es una inmobiliaria con su sesión (no el equipo, ni el panel de Supabase), sus fotos tienen
-- que estar en su propia carpeta del depósito: ni las de otra cuenta, ni direcciones de fuera.
create or replace function public.require_own_project_photos(owner uuid, photos text[])
returns void
language plpgsql
stable
set search_path = ''
as $$
begin
  if exists (select 1 from unnest(photos) as photo where photo not like owner::text || '/%') then
    raise exception 'invalid_photos' using errcode = 'RZ002';
  end if;
end;
$$;

-- Antes de guardar un proyecto nuevo de una inmobiliaria: es suyo, sale publicado y cabe en su plan. Los
-- proyectos que carga el equipo (con su sesión o desde el panel de Supabase) no pasan por aquí.
create or replace function public.prepare_project()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  author uuid := (select auth.uid());
  allowed integer;
begin
  if author is null or public.is_admin() then
    return new;
  end if;

  new.owner_id := author;
  new.status := 'published';
  new.created_at := now();
  new.updated_at := now();

  -- Uno a la vez por cuenta: dos enviados juntos no caben en el último lugar del plan.
  perform pg_advisory_xact_lock(hashtextextended('projects:' || author::text, 0));
  select max_projects into allowed from public.profiles where id = author;

  -- Reintentar un proyecto ya guardado no gasta el límite: la unicidad de la clave hace que no se guarde otro.
  if not exists (select 1 from public.projects where owner_id = author and operation_key = new.operation_key)
    and (select count(*) from public.projects where owner_id = author and status = 'published') >= coalesce(allowed, 0)
  then
    -- El sitio reconoce este código y explica que el plan no admite más proyectos.
    raise exception 'project_limit_reached' using errcode = 'RZ001';
  end if;

  perform public.require_own_project_photos(author, new.photos);

  return new;
end;
$$;

create or replace trigger prepare_project_before_insert
  before insert on public.projects
  for each row execute function public.prepare_project();

-- Antes de guardar un cambio de una inmobiliaria: lo que identifica al proyecto no cambia, solo lo pasa de
-- publicado a borrador y al revés (lo que ocultó el equipo sigue oculto), y volver a publicar cabe en su plan.
create or replace function public.keep_project_consistent()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  author uuid := (select auth.uid());
  allowed integer;
begin
  new.id := old.id;
  new.owner_id := old.owner_id;
  new.operation_key := old.operation_key;
  new.created_at := old.created_at;
  new.updated_at := now();

  if author is null or public.is_admin() then
    return new;
  end if;

  if old.status = 'hidden' or new.status not in ('published', 'draft') then
    new.status := old.status;
  end if;
  if new.photos is distinct from old.photos then
    perform public.require_own_project_photos(author, new.photos);
  end if;

  if new.status = 'published' and old.status <> 'published' then
    perform pg_advisory_xact_lock(hashtextextended('projects:' || author::text, 0));
    select max_projects into allowed from public.profiles where id = author;

    if (select count(*) from public.projects where owner_id = author and status = 'published') >= coalesce(allowed, 0) then
      raise exception 'project_limit_reached' using errcode = 'RZ001';
    end if;
  end if;

  return new;
end;
$$;

create or replace trigger keep_project_consistent_before_update
  before update on public.projects
  for each row execute function public.keep_project_consistent();

-- Como mucho 20 modelos por proyecto: más no cabrían en la ficha.
create or replace function public.limit_project_models()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select count(*) from public.project_models where project_id = new.project_id) >= 20 then
    raise exception 'too_many_models' using errcode = 'RZ002';
  end if;

  return new;
end;
$$;

create or replace trigger limit_project_models_before_insert
  before insert on public.project_models
  for each row execute function public.limit_project_models();

-- Fotos de proyectos: cada inmobiliaria sube, reemplaza y borra las de su carpeta (la primera parte de la
-- ruta es su identificador). El equipo gestiona todas con la política de 20261016000000_proyectos.sql.
drop policy if exists "Fotos de proyectos: cada inmobiliaria sube las suyas" on storage.objects;
create policy "Fotos de proyectos: cada inmobiliaria sube las suyas" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'project-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and coalesce((select max_projects from public.profiles where id = (select auth.uid())), 0) > 0
  );

drop policy if exists "Fotos de proyectos: cada inmobiliaria reemplaza las suyas" on storage.objects;
create policy "Fotos de proyectos: cada inmobiliaria reemplaza las suyas" on storage.objects
  for update to authenticated
  using (bucket_id = 'project-photos' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'project-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "Fotos de proyectos: cada inmobiliaria borra las suyas" on storage.objects;
create policy "Fotos de proyectos: cada inmobiliaria borra las suyas" on storage.objects
  for delete to authenticated
  using (bucket_id = 'project-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "Fotos de proyectos: cada inmobiliaria ve las suyas" on storage.objects;
create policy "Fotos de proyectos: cada inmobiliaria ve las suyas" on storage.objects
  for select to authenticated
  using (bucket_id = 'project-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- Una cuenta tiene un plan de pago si puede publicar más de un anuncio a la vez (agente o inmobiliaria) o
-- algún proyecto (inmobiliaria). Es lo que deciden los destacados de la portada.
create or replace function public.has_paid_plan(account public.profiles)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select account.max_publications > 1 or account.max_projects > 0
$$;

create or replace function public.featured_properties(max_count integer default 6)
returns setof public.properties
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
    from public.properties p
    join public.profiles owner on owner.id = p.owner_id
    where p.status = 'published'
      and public.has_paid_plan(owner)
  )
  select p.*
  from per_account chosen
  join public.properties p on p.id = chosen.id
  where chosen.position <= 2
  order by chosen.turn
  limit least(greatest(coalesce(max_count, 6), 0), 24)
$$;

-- Devuelve las filas de `projects`, que ahora tienen dos columnas más: se vuelve a crear.
drop function if exists public.featured_projects(integer);
create function public.featured_projects(max_count integer default 6)
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
      and public.has_paid_plan(owner)
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

-- Los dos límites de una cuenta, en un solo paso: lo que hace el equipo al activar un plan contratado.
create or replace function public.admin_set_account_limits(
  target_account uuid,
  new_publications integer,
  new_projects integer,
  review_note text default ''
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.require_admin();

  if new_publications is null or new_publications not between 0 and 1000
    or new_projects is null or new_projects not between 0 and 1000 then
    raise exception 'invalid_limit' using errcode = 'RZ002';
  end if;

  update public.profiles
  set max_publications = new_publications, max_projects = new_projects
  where id = target_account;
  if not found then
    raise exception 'account_not_found' using errcode = 'RZ003';
  end if;

  insert into public.moderation_log (actor_id, action, account_id, note)
  values (
    (select auth.uid()),
    'set_account_limits:' || new_publications || '/' || new_projects,
    target_account,
    left(btrim(coalesce(review_note, '')), 500)
  );
end;
$$;

revoke execute on function public.admin_set_account_limits(uuid, integer, integer, text) from public, anon;
grant execute on function public.admin_set_account_limits(uuid, integer, integer, text) to authenticated;

-- La lista de cuentas del panel, ahora también con cuántos proyectos admite y tiene publicados cada una.
drop function if exists public.admin_list_accounts(text, integer, integer);
create function public.admin_list_accounts(search text default '', page_offset integer default 0, page_limit integer default 20)
returns table (
  id uuid,
  email text,
  first_name text,
  last_name text,
  phone text,
  max_publications integer,
  max_projects integer,
  role text,
  created_at timestamptz,
  published_count bigint,
  project_count bigint,
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
      p.max_projects,
      p.role,
      p.created_at,
      (select count(*) from public.properties pr where pr.owner_id = p.id and pr.status = 'published'),
      (select count(*) from public.projects pj where pj.owner_id = p.id and pj.status = 'published'),
      count(*) over ()
    from public.profiles p
    join auth.users u on u.id = p.id
    where u.email ilike pattern or (p.first_name || ' ' || p.last_name) ilike pattern
    order by p.created_at desc, p.id
    offset greatest(coalesce(page_offset, 0), 0)
    limit least(greatest(coalesce(page_limit, 20), 1), 100);
end;
$$;

revoke execute on function public.admin_list_accounts(text, integer, integer) from public, anon;
grant execute on function public.admin_list_accounts(text, integer, integer) to authenticated;
