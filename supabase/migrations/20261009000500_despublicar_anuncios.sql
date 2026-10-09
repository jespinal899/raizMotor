-- Despublicar anuncios: quien publicó un anuncio puede retirarlo del catálogo y volver a publicarlo, y el
-- límite del plan pasa a contar solo los anuncios que están publicados.
--
-- Necesita antes: 20261009000000_perfiles.sql, 20261009000100_anuncios.sql y 20261009000400_editar_anuncios.sql.
-- Se aplica en el panel de Supabase: SQL Editor > New query > pegar todo > Run.
--
-- Es idempotente: ejecutarla otra vez deja exactamente lo mismo, y no cambia ningún anuncio ya guardado.
-- Despublicar un anuncio ya despublicado, o volver a publicar uno ya publicado, también lo deja igual.

do $$
begin
  if to_regclass('public.profiles') is null then
    raise exception 'Falta aplicar antes la migración 20261009000000_perfiles.sql';
  end if;
  if to_regclass('public.properties') is null then
    raise exception 'Falta aplicar antes la migración 20261009000100_anuncios.sql';
  end if;
  -- Esta migración sustituye lo que aquella guarda al editar: tiene que existir antes.
  if to_regprocedure('public.keep_property_consistent()') is null then
    raise exception 'Falta aplicar antes la migración 20261009000400_editar_anuncios.sql';
  end if;
end;
$$;

-- Un anuncio está en uno de tres estados:
--   `published`    en el catálogo, a la vista de cualquiera.
--   `unpublished`  lo retiró quien lo publicó, que puede volver a publicarlo.
--   `hidden`       lo retiró el equipo del sitio desde el panel; solo el equipo lo devuelve.
-- Fuera del catálogo, un anuncio solo lo sigue viendo quien lo publicó: ese permiso no cambia.
alter table public.properties drop constraint if exists properties_status_check;
alter table public.properties add constraint properties_status_check
  check (status in ('published', 'unpublished', 'hidden'));

-- Antes de guardar un anuncio nuevo. Es la función de 20261009000100_anuncios.sql con un cambio: el límite
-- cuenta solo los anuncios publicados, así que despublicar uno deja libre su lugar.
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
    select count(*) from public.properties where owner_id = new.owner_id and status = 'published'
  ) >= coalesce(owner.max_publications, 1) then
    -- El sitio reconoce este código y explica que el plan no admite más anuncios.
    raise exception 'publication_limit_reached' using errcode = 'RZ001';
  end if;

  new.advertiser_name := trim(coalesce(owner.first_name, '') || ' ' || coalesce(owner.last_name, ''));
  new.advertiser_phone := coalesce(owner.phone, '');

  return new;
end;
$$;

-- Antes de guardar un cambio. Es la función de 20261009000400_editar_anuncios.sql con un cambio: quien
-- publicó el anuncio ya puede despublicarlo y volver a publicarlo.
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
  -- Lo que el equipo ocultó sigue oculto, y nadie oculta por su cuenta: eso se hace desde el panel.
  if (select auth.uid()) is not null then
    if old.status = 'hidden' or new.status not in ('published', 'unpublished') then
      new.status := old.status;
    end if;

    -- Volver a publicar ocupa un lugar del plan, igual que publicar un anuncio nuevo.
    if new.status = 'published' and old.status <> 'published' and (
      select count(*) from public.properties where owner_id = new.owner_id and status = 'published'
    ) >= coalesce(owner.max_publications, 1) then
      raise exception 'publication_limit_reached' using errcode = 'RZ001';
    end if;
  end if;

  -- El anunciante nunca lo escribe el sitio: sale siempre del perfil de la cuenta.
  new.advertiser_name := trim(coalesce(owner.first_name, '') || ' ' || coalesce(owner.last_name, ''));
  new.advertiser_phone := coalesce(owner.phone, '');

  new.updated_at := now();

  return new;
end;
$$;
