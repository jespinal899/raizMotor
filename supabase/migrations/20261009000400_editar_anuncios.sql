-- Editar anuncios: quien publicó un anuncio puede corregirlo, y el servidor cuida lo que no debe cambiar.
--
-- Necesita antes: 20261009000000_perfiles.sql y 20261009000100_anuncios.sql.
-- Se aplica en el panel de Supabase: SQL Editor > New query > pegar todo > Run.
--
-- Es idempotente: ejecutarla otra vez deja exactamente lo mismo. No cambia ningún anuncio ya guardado; a los
-- que existían les pone como fecha de último cambio la del momento en que se aplica por primera vez.
--
-- Guardar dos veces los mismos cambios deja el anuncio igual: editar también es idempotente.

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

-- Cuándo se cambió el anuncio por última vez.
alter table public.properties add column if not exists updated_at timestamptz not null default now();

grant update on public.properties to authenticated;

drop policy if exists "Cada cuenta edita sus anuncios" on public.properties;
create policy "Cada cuenta edita sus anuncios" on public.properties
  for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

-- Antes de guardar un cambio: se conserva lo que identifica al anuncio, se copian otra vez del perfil el
-- nombre y el teléfono del anunciante, y se anota la fecha.
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

  -- Ocultar o volver a mostrar un anuncio es cosa del equipo, desde el panel: quien edita con su sesión del
  -- sitio no cambia su estado, y así tampoco vuelve a publicar uno que se le ocultó.
  if (select auth.uid()) is not null then
    new.status := old.status;
  end if;

  -- El anunciante nunca lo escribe el sitio: sale siempre del perfil de la cuenta.
  select * into owner from public.profiles where id = new.owner_id;
  new.advertiser_name := trim(coalesce(owner.first_name, '') || ' ' || coalesce(owner.last_name, ''));
  new.advertiser_phone := coalesce(owner.phone, '');

  new.updated_at := now();

  return new;
end;
$$;

create or replace trigger keep_property_consistent_before_update
  before update on public.properties
  for each row execute function public.keep_property_consistent();
