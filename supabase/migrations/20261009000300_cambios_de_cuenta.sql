-- Cambios de cuenta: cuando alguien corrige su nombre o su teléfono, su perfil y sus anuncios lo reflejan.
--
-- Necesita antes: 20261009000000_perfiles.sql y 20261009000100_anuncios.sql.
-- Se aplica en el panel de Supabase: SQL Editor > New query > pegar todo > Run.
--
-- Es idempotente: ejecutarla otra vez deja exactamente lo mismo. No cambia ningún perfil ni ningún anuncio:
-- solo declara lo que debe pasar cuando una cuenta cambie sus datos.

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

-- El sitio cambia los datos de la cuenta, no el perfil: el perfil se copia de ellos, igual que al registrarse.
-- Así el sitio sigue sin poder escribir en `profiles`, donde está el límite de anuncios.
create or replace function public.handle_user_updated()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles
  set
    first_name = coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    last_name = coalesce(new.raw_user_meta_data ->> 'last_name', ''),
    phone = coalesce(new.raw_user_meta_data ->> 'phone', '')
  where id = new.id;

  return new;
end;
$$;

create or replace trigger on_auth_user_updated
  after update of raw_user_meta_data on auth.users
  for each row
  when (old.raw_user_meta_data is distinct from new.raw_user_meta_data)
  execute function public.handle_user_updated();

-- Cada anuncio lleva copiados el nombre y el teléfono de quien publica. Al cambiar el perfil se copian de
-- nuevo en sus anuncios: si no, el botón de WhatsApp seguiría llevando al número anterior.
create or replace function public.sync_advertiser()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.properties
  set
    advertiser_name = trim(new.first_name || ' ' || new.last_name),
    advertiser_phone = new.phone
  where owner_id = new.id;

  return new;
end;
$$;

create or replace trigger sync_advertiser_after_update
  after update of first_name, last_name, phone on public.profiles
  for each row execute function public.sync_advertiser();
