-- Limpieza de fotos de proyectos: las del depósito `project-photos` que ya no usa ningún proyecto. Quedan, por
-- ejemplo, al eliminar un proyecto, al quitar fotos al editarlo, o cuando el proyecto no llega a guardarse. La
-- función `cleanup-photos` (supabase/functions) las pide aquí, junto con las de los anuncios, y las borra con
-- la API de Storage una vez al día.
--
-- Necesita antes: 20261014000000_limpieza_de_fotos.sql y 20261016000000_proyectos.sql.
-- Se aplica con `supabase db push` o en el panel de Supabase: SQL Editor > New query > pegar todo > Run.
--
-- Es idempotente: ejecutarla otra vez deja exactamente lo mismo. No borra nada: solo dice qué sobra.
--
-- Las mismas reglas que con los anuncios: nunca cuenta como huérfana una foto de un proyecto que exista, esté
-- publicado, en borrador u oculto, ni una que se subió o se reemplazó hace menos de 24 horas.

do $$
begin
  if to_regprocedure('public.orphan_photos(interval, integer)') is null then
    raise exception 'Falta aplicar antes la migración 20261014000000_limpieza_de_fotos.sql';
  end if;
  if to_regclass('public.projects') is null then
    raise exception 'Falta aplicar antes la migración 20261016000000_proyectos.sql';
  end if;
end;
$$;

-- Para preguntar rápido si algún proyecto usa una ruta.
create index if not exists projects_photos_idx on public.projects using gin (photos);

create or replace function public.orphan_project_photos(min_age interval default interval '24 hours', max_rows integer default 1000)
returns table (name text)
language sql
stable
security definer
set search_path = ''
as $$
  select o.name
  from storage.objects o
  where o.bucket_id = 'project-photos'
    and greatest(o.created_at, o.updated_at) < now() - greatest(min_age, interval '1 hour')
    and not exists (select 1 from public.projects p where p.photos @> array[o.name])
  order by o.created_at
  limit greatest(1, least(coalesce(max_rows, 1000), 1000))
$$;

create or replace function public.count_orphan_project_photos(min_age interval default interval '24 hours')
returns bigint
language sql
stable
security definer
set search_path = ''
as $$
  select count(*)
  from storage.objects o
  where o.bucket_id = 'project-photos'
    and greatest(o.created_at, o.updated_at) < now() - greatest(min_age, interval '1 hour')
    and not exists (select 1 from public.projects p where p.photos @> array[o.name])
$$;

-- Solo las usa la función `cleanup-photos`, con la clave de servicio: el navegador no sabe qué sobra.
revoke execute on function
  public.orphan_project_photos(interval, integer),
  public.count_orphan_project_photos(interval)
from public, anon, authenticated;

grant execute on function
  public.orphan_project_photos(interval, integer),
  public.count_orphan_project_photos(interval)
to service_role;
