-- Búsqueda en el servidor: el catálogo se filtra, se ordena y se pagina en la base de datos, en lugar de
-- enviar todos los anuncios al navegador para que él los filtre.
--
-- Necesita antes: 20261009000100_anuncios.sql.
-- Se aplica con `supabase db push` o en el panel de Supabase: SQL Editor > New query > pegar todo > Run.
--
-- Es idempotente: ejecutarla otra vez deja exactamente lo mismo. No cambia ningún dato que se escriba: añade
-- dos columnas que la base calcula sola a partir de las que ya existen, y los índices que usa la búsqueda.

do $$
begin
  if to_regclass('public.properties') is null then
    raise exception 'Falta aplicar antes la migración 20261009000100_anuncios.sql';
  end if;
end;
$$;

-- Para buscar por zona sin distinguir mayúsculas ni tildes: «Choluteca» encuentra «choluteca» y «San Pedro
-- Sula» encuentra «san pedro sula». Es la misma regla que aplica el sitio al texto que se busca
-- (src/shared/utils/text.ts, `normalizeText`).
create or replace function public.search_text(value text)
returns text
language sql
immutable
parallel safe
set search_path = ''
as $$
  select btrim(translate(lower(coalesce(value, '')), 'áàäâãéèëêíìïîóòöôõúùüûñç', 'aaaaaeeeeiiiiooooouuuunc'))
$$;

-- La zona de cada anuncio, ya normalizada: la colonia y la ciudad, como las compara la búsqueda.
alter table public.properties
  add column if not exists search_place text
  generated always as (public.search_text(neighborhood || ' ' || city)) stored;

-- La superficie con la que se ordena «Mayor superficie»: la construida o, si no tiene, la del terreno.
alter table public.properties
  add column if not exists area numeric
  generated always as (coalesce(built_area, land_area)) stored;

-- Buscar un trozo de texto dentro de la zona («palmira» en «colonia palmira tegucigalpa») necesita un índice
-- de trigramas: uno normal solo sirve para comparar desde el principio.
create extension if not exists pg_trgm with schema extensions;

create index if not exists properties_search_place_idx
  on public.properties using gin (search_place extensions.gin_trgm_ops)
  where status = 'published';

-- Los filtros que casi siempre van juntos en el catálogo: operación, tipo y rango de precio.
create index if not exists properties_filters_idx
  on public.properties (operation, type, price)
  where status = 'published';
