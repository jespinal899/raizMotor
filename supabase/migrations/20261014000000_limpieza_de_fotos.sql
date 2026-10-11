-- Limpieza de fotos huérfanas: las del depósito `property-photos` que ya no usa ningún anuncio. Quedan, por
-- ejemplo, cuando se suben las fotos y el anuncio no llega a guardarse (límite del plan, conexión cortada,
-- página cerrada), cuando falla el borrado de las fotos viejas al editar o borrar un anuncio, o cuando se
-- elimina una cuenta. La función `cleanup-photos` (supabase/functions) las pide aquí y las borra con la API de
-- Storage, una vez al día.
--
-- Necesita antes: 20261009000100_anuncios.sql y 20261009000200_fotos_de_anuncios.sql.
-- Se aplica con `supabase db push` o en el panel de Supabase: SQL Editor > New query > pegar todo > Run.
--
-- Es idempotente: ejecutarla otra vez deja exactamente lo mismo. No borra nada: solo dice qué sobra.
--
-- Nunca cuenta como huérfana una foto de un anuncio que exista, esté publicado, despublicado u oculto por el
-- equipo, ni una que se subió o se reemplazó hace menos de 24 horas: así no se toca lo de quien está
-- publicando o editando en ese momento.

do $$
begin
  if to_regclass('public.properties') is null then
    raise exception 'Falta aplicar antes la migración 20261009000100_anuncios.sql';
  end if;
  if not exists (select 1 from storage.buckets where id = 'property-photos') then
    raise exception 'Falta aplicar antes la migración 20261009000200_fotos_de_anuncios.sql';
  end if;
end;
$$;

-- Para preguntar rápido si alguna fila de `properties` usa una ruta.
create index if not exists properties_photos_idx on public.properties using gin (photos);

-- Las fotos que sobran, de la más antigua a la más nueva. `min_age` nunca baja de una hora, aunque se pida menos.
create or replace function public.orphan_photos(min_age interval default interval '24 hours', max_rows integer default 1000)
returns table (name text)
language sql
stable
security definer
set search_path = ''
as $$
  select o.name
  from storage.objects o
  where o.bucket_id = 'property-photos'
    and greatest(o.created_at, o.updated_at) < now() - greatest(min_age, interval '1 hour')
    and not exists (select 1 from public.properties p where p.photos @> array[o.name])
  order by o.created_at
  limit greatest(1, least(coalesce(max_rows, 1000), 1000))
$$;

-- Cuántas sobran, para la ejecución de prueba, que no borra nada.
create or replace function public.count_orphan_photos(min_age interval default interval '24 hours')
returns bigint
language sql
stable
security definer
set search_path = ''
as $$
  select count(*)
  from storage.objects o
  where o.bucket_id = 'property-photos'
    and greatest(o.created_at, o.updated_at) < now() - greatest(min_age, interval '1 hour')
    and not exists (select 1 from public.properties p where p.photos @> array[o.name])
$$;

-- Solo las usa la función `cleanup-photos`, con la clave de servicio: el navegador no sabe qué sobra.
revoke execute on function
  public.orphan_photos(interval, integer),
  public.count_orphan_photos(interval)
from public, anon, authenticated;

grant execute on function
  public.orphan_photos(interval, integer),
  public.count_orphan_photos(interval)
to service_role;
