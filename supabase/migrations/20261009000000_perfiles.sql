-- Perfiles de las cuentas: lo que el sitio necesita saber de quien publica.
--
-- Es la primera migración: no necesita ninguna otra.
-- Se aplica en el panel de Supabase: SQL Editor > New query > pegar todo > Run.
--
-- Es idempotente: ejecutarla otra vez, con la base vacía o ya con cuentas, deja exactamente lo mismo. No
-- cambia ningún perfil ni su límite de anuncios. Lo que declara (la función, el disparador y el permiso)
-- queda siempre como dice este archivo.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  first_name text not null default '',
  last_name text not null default '',
  -- Completo y sin separadores, como lo envía el registro: +50499999999.
  phone text not null default '',
  -- Cuántos anuncios puede tener la cuenta a la vez. Uno con el plan Propietario; cuando alguien contrata
  -- un plan, se sube a mano en esta tabla (Table Editor > profiles).
  max_publications integer not null default 1 check (max_publications >= 0),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

grant select on public.profiles to authenticated;

-- Cada cuenta lee solo su perfil, y el sitio nunca lo escribe: nadie puede subirse su propio límite.
drop policy if exists "Cada cuenta lee su perfil" on public.profiles;
create policy "Cada cuenta lee su perfil" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()));

-- Al crearse una cuenta, su perfil se copia de los datos que dio al registrarse.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, first_name, last_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Las cuentas que ya existían antes de este cambio.
insert into public.profiles (id, first_name, last_name, phone)
select
  id,
  coalesce(raw_user_meta_data ->> 'first_name', ''),
  coalesce(raw_user_meta_data ->> 'last_name', ''),
  coalesce(raw_user_meta_data ->> 'phone', '')
from auth.users
on conflict (id) do nothing;
