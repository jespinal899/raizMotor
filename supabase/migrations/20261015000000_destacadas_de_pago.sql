-- Propiedades destacadas de la portada: salen solo de las cuentas con un plan de pago, es decir, las que
-- pueden tener más de un anuncio publicado a la vez (`profiles.max_publications > 1`). El plan gratis
-- Propietario admite uno; el equipo sube el límite al aprobar un plan (Agente Pro, Agente Élite) y lo baja si
-- deja de pagarse, y con eso sus anuncios entran o salen de la portada solos.
--
-- Necesita antes: 20261009000000_perfiles.sql y 20261009000100_anuncios.sql.
-- Se aplica con `supabase db push` o en el panel de Supabase: SQL Editor > New query > pegar todo > Run.
--
-- Es idempotente: ejecutarla otra vez deja exactamente lo mismo. No cambia ningún dato: solo añade la
-- función que lee la portada.

do $$
begin
  if to_regclass('public.profiles') is null then
    raise exception 'Falta aplicar antes la migración 20261009000000_perfiles.sql';
  end if;
  if to_regclass('public.properties') is null then
    raise exception 'Falta aplicar antes la migración 20261009000100_anuncios.sql';
  end if;
end;
$$;

-- Los anuncios destacados, como mucho `max_count` (entre 0 y 24).
--
-- - Solo anuncios publicados: lo despublicado por su dueño o lo oculto por el equipo nunca sale.
-- - Como mucho 2 por cuenta, para que una cuenta con muchos anuncios no llene la portada ella sola.
-- - El orden rota cada hora: así salen, por turnos, todos los anuncios de quienes pagan. Dentro de la misma
--   hora el orden es siempre el mismo, para que la portada no cambie en cada visita.
--
-- Corre con los permisos de su dueño porque necesita leer los perfiles, que cada cuenta solo puede leer el
-- suyo. No entrega nada de los perfiles: solo anuncios publicados, que cualquiera ya puede ver.
create or replace function public.featured_properties(max_count integer default 6)
returns setof public.properties
language sql
stable
security definer
set search_path = ''
as $$
  with shuffled as (
    select
      p.id,
      md5(p.id::text || date_trunc('hour', now())::text) as turn
    from public.properties p
    join public.profiles owner on owner.id = p.owner_id
    where p.status = 'published'
      and owner.max_publications > 1
  ),
  per_account as (
    select
      s.id,
      s.turn,
      row_number() over (partition by p.owner_id order by s.turn) as position
    from shuffled s
    join public.properties p on p.id = s.id
  )
  select p.*
  from per_account chosen
  join public.properties p on p.id = chosen.id
  where chosen.position <= 2
  order by chosen.turn
  limit least(greatest(coalesce(max_count, 6), 0), 24)
$$;

revoke execute on function public.featured_properties(integer) from public;
grant execute on function public.featured_properties(integer) to anon, authenticated;
