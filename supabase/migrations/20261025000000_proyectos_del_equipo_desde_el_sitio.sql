-- Que una cuenta del equipo pueda publicar un proyecto desde el sitio, como cualquier inmobiliaria.
--
-- El sitio no manda de quién es un proyecto nuevo ni su estado: los fija `prepare_project` con la sesión. Pero
-- con una cuenta del equipo la función no hacía nada, y el proyecto llegaba sin dueño (la base lo rechazaba y
-- el sitio decía «No pudimos guardar el proyecto»). Ahora, si una cuenta del equipo no dice de quién es, es
-- suyo; y si llega desde el sitio (con su clave de operación), sale publicado al guardarlo. Lo que el equipo
-- carga desde el panel de Supabase sigue igual: con el dueño y el estado que escriba.
--
-- Necesita antes: 20261017000000_proyectos_de_inmobiliarias.sql.
-- Se aplica con `supabase db push` o en el panel de Supabase: SQL Editor > New query > pegar todo > Run.
--
-- Es idempotente: ejecutarla otra vez deja exactamente lo mismo. No cambia ningún proyecto guardado.

do $$
begin
  if to_regprocedure('public.prepare_project()') is null then
    raise exception 'Falta aplicar antes la migración 20261017000000_proyectos_de_inmobiliarias.sql';
  end if;
end;
$$;

-- Antes de guardar un proyecto nuevo de una inmobiliaria: es suyo, sale publicado y cabe en su plan. Los del
-- equipo no tienen límite ni carpeta obligada para sus fotos.
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
  if author is null then
    return new;
  end if;

  if public.is_admin() then
    new.owner_id := coalesce(new.owner_id, author);
    -- Desde el sitio, con su clave de operación: se publica al guardarlo, como el de una inmobiliaria.
    if new.operation_key is not null then
      new.status := 'published';
      new.created_at := now();
      new.updated_at := now();
    end if;

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
