-- Perfiles de inmobiliaria: solo los crea una cuenta con plan de inmobiliaria, cada una edita el suyo, la
-- verificación es del equipo y el público solo ve los de planes activos.
-- Se ejecuta con `supabase test db`.
begin;

select plan(17);

insert into auth.users (id, email) values
  ('81111111-1111-4111-8111-111111111111', 'inmobiliaria.d@prueba.hn'),
  ('82222222-2222-4222-8222-222222222222', 'otra.inmobiliaria.d@prueba.hn'),
  ('83333333-3333-4333-8333-333333333333', 'particular.d@prueba.hn'),
  ('84444444-4444-4444-8444-444444444444', 'equipo.d@prueba.hn');
update public.profiles set max_projects = 1
where id in ('81111111-1111-4111-8111-111111111111', '82222222-2222-4222-8222-222222222222');
update public.profiles set role = 'admin' where id = '84444444-4444-4444-8444-444444444444';

-- Entra como `account`; sin cuenta, como un visitante sin sesión.
create function pg_temp.as_account(account uuid) returns void language sql as $$
  select set_config('role', 'authenticated', true),
         set_config('request.jwt.claims', json_build_object('sub', account, 'role', 'authenticated')::text, true);
$$;
create function pg_temp.as_visitor() returns void language sql as $$
  select set_config('role', 'anon', true), set_config('request.jwt.claims', '{"role":"anon"}', true);
$$;
create function pg_temp.as_postgres() returns void language sql as $$
  select set_config('role', 'postgres', true), set_config('request.jwt.claims', '', true);
$$;

select pg_temp.as_account('81111111-1111-4111-8111-111111111111');
select lives_ok($$
  insert into public.agencies (owner_id, slug, name, logo, verified)
  values ('81111111-1111-4111-8111-111111111111', 'casa-norte', '  Casa Norte  ',
          '81111111-1111-4111-8111-111111111111/logo-1.webp', true)
$$, 'una inmobiliaria crea su perfil');
select is((select name || '/' || verified from public.agencies where slug = 'casa-norte'), 'Casa Norte/false',
  'sin espacios de más y sin verificar, aunque lo pida');
select throws_ok($$
  insert into public.agencies (owner_id, slug, name) values ('82222222-2222-4222-8222-222222222222', 'ajena', 'Ajena')
$$, '42501', null, 'no crea el perfil de otra cuenta');
select throws_ok($$
  update public.agencies set logo = '82222222-2222-4222-8222-222222222222/logo.webp' where slug = 'casa-norte'
$$, 'RZ002', null, 'no usa un logo de la carpeta de otra cuenta');
select pg_temp.as_postgres();

select pg_temp.as_account('82222222-2222-4222-8222-222222222222');
select throws_ok($$
  insert into public.agencies (owner_id, slug, name) values ('82222222-2222-4222-8222-222222222222', 'casa-norte', 'Copia')
$$, '23505', null, 'no repite la dirección de otra');
select throws_ok($$
  insert into public.agencies (owner_id, slug, name) values ('82222222-2222-4222-8222-222222222222', 'Con Espacios', 'Otra')
$$, '23514', null, 'la dirección solo lleva minúsculas, números y guiones');
update public.agencies set name = 'Robada' where slug = 'casa-norte';
select pg_temp.as_postgres();
select is((select name from public.agencies where slug = 'casa-norte'), 'Casa Norte', 'otra cuenta no edita el perfil ajeno');

select pg_temp.as_account('83333333-3333-4333-8333-333333333333');
select throws_ok($$
  insert into public.agencies (owner_id, slug, name) values ('83333333-3333-4333-8333-333333333333', 'particular', 'Particular')
$$, 'RZ006', null, 'sin plan de inmobiliaria no hay perfil');
select pg_temp.as_postgres();

-- La verificación es del equipo, queda en el registro y se pierde al cambiar de nombre.
select pg_temp.as_account('81111111-1111-4111-8111-111111111111');
select throws_ok($$ select public.admin_set_agency_verified('81111111-1111-4111-8111-111111111111', true, '') $$,
  '42501', null, 'una inmobiliaria no se verifica a sí misma');
select pg_temp.as_account('84444444-4444-4444-8444-444444444444');
select lives_ok($$ select public.admin_set_agency_verified('81111111-1111-4111-8111-111111111111', true, 'RTN revisado') $$,
  'el equipo la verifica');
select pg_temp.as_postgres();
select is((select count(*)::int from public.moderation_log
           where action = 'verify_agency' and account_id = '81111111-1111-4111-8111-111111111111'), 1, 'y queda en el registro');

select pg_temp.as_account('81111111-1111-4111-8111-111111111111');
update public.agencies set description = 'Casas en San Pedro Sula', verified = false where slug = 'casa-norte';
select pg_temp.as_postgres();
select is((select verified from public.agencies where slug = 'casa-norte'), true, 'corregir otros datos no le quita la marca');
select pg_temp.as_account('81111111-1111-4111-8111-111111111111');
update public.agencies set name = 'Casa Norte Bienes Raíces' where slug = 'casa-norte';
select pg_temp.as_postgres();
select is((select verified from public.agencies where slug = 'casa-norte'), false, 'cambiar el nombre sí');

-- El público ve los perfiles con plan activo, y deja de verlos si el plan se retira.
select pg_temp.as_visitor();
select is((select count(*)::int from public.agencies where slug = 'casa-norte'), 1, 'un visitante ve el perfil');
select pg_temp.as_postgres();
update public.profiles set max_projects = 0 where id = '81111111-1111-4111-8111-111111111111';
select pg_temp.as_visitor();
select is((select count(*)::int from public.agencies where slug = 'casa-norte'), 0, 'sin plan, el perfil no se ve');
select pg_temp.as_account('81111111-1111-4111-8111-111111111111');
select is((select count(*)::int from public.agencies where slug = 'casa-norte'), 1, 'pero su dueña lo sigue viendo');
select pg_temp.as_visitor();
select throws_ok($$ insert into public.agencies (owner_id, slug, name) values (gen_random_uuid(), 'anonima', 'Anónima') $$,
  '42501', null, 'sin sesión no se crea ningún perfil');
select pg_temp.as_postgres();

select * from finish();
rollback;
