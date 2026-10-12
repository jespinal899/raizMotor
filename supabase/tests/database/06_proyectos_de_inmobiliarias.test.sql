-- Proyectos de las inmobiliarias: cada una gestiona los suyos hasta el límite de su plan, y nadie más los toca.
-- Se ejecuta con `supabase test db`.
begin;

select plan(16);

insert into auth.users (id, email) values
  ('61111111-1111-4111-8111-111111111111', 'inmobiliaria.b@prueba.hn'),
  ('62222222-2222-4222-8222-222222222222', 'otra.inmobiliaria@prueba.hn'),
  ('63333333-3333-4333-8333-333333333333', 'particular.b@prueba.hn'),
  ('64444444-4444-4444-8444-444444444444', 'equipo.b@prueba.hn');
update public.profiles set max_projects = 1 where id in ('61111111-1111-4111-8111-111111111111', '62222222-2222-4222-8222-222222222222');
update public.profiles set role = 'admin' where id = '64444444-4444-4444-8444-444444444444';

-- Entra como `account`.
create function pg_temp.as_account(account uuid) returns void language sql as $$
  select set_config('role', 'authenticated', true),
         set_config('request.jwt.claims', json_build_object('sub', account, 'role', 'authenticated')::text, true);
$$;

-- Guarda un proyecto con la sesión abierta, con esa clave y esas fotos, pidiendo otro dueño y estado.
create function pg_temp.save(key text, photo text) returns void language sql as $$
  insert into public.projects (
    operation_key, owner_id, status, name, developer_name, description, kind, stage, price_from,
    department, city, neighborhood, address, latitude, longitude, photos
  ) values (
    key, '62222222-2222-4222-8222-222222222222', 'hidden', 'Residencial ' || key, 'Inmobiliaria B',
    'Residencial cerrada con áreas verdes, parque y seguridad, a pocos minutos del centro.',
    'residencial', 'construccion', 80000, 'cortes', 'San Pedro Sula', 'Colonia Trejo', '10 calle',
    15.5042, -88.025, array[photo]
  )
  on conflict (owner_id, operation_key) do nothing
$$;

select pg_temp.as_account('61111111-1111-4111-8111-111111111111');
select throws_ok($$ select pg_temp.save('b-3', '62222222-2222-4222-8222-222222222222/x/0.webp') $$,
  'RZ002', null, 'no usa fotos de la carpeta de otra cuenta');
select throws_ok($$ select pg_temp.save('b-4', 'https://otro.example/foto.webp') $$,
  'RZ002', null, 'ni direcciones de fuera');
select lives_ok($$ select pg_temp.save('b-1', '61111111-1111-4111-8111-111111111111/b-1/0.webp') $$,
  'una inmobiliaria publica un proyecto');
select is((select owner_id::text || '/' || status from public.projects where operation_key = 'b-1'),
  '61111111-1111-4111-8111-111111111111/published', 'queda a su nombre y publicado, aunque pida otra cosa');
select lives_ok($$ select pg_temp.save('b-1', '61111111-1111-4111-8111-111111111111/b-1/0.webp') $$,
  'repetir el envío con la misma clave no falla');
select is((select count(*)::int from public.projects where operation_key = 'b-1'), 1, 'ni guarda otro');
select throws_ok($$ select pg_temp.save('b-2', '61111111-1111-4111-8111-111111111111/b-2/0.webp') $$,
  'RZ001', null, 'no publica más proyectos de los que admite su plan');

insert into public.project_models (project_id, name, bedrooms, bathrooms, area, price_from)
select id, 'Casa Roble', 2, 1, 72, 80000 from public.projects where operation_key = 'b-1';
select is((select count(*)::int from public.project_models), 1, 'agrega modelos a su proyecto');

update public.projects set status = 'draft' where operation_key = 'b-1';
select is((select status from public.projects where operation_key = 'b-1'), 'draft', 'lo despublica');
update public.projects set status = 'published', name = 'Residencial renombrada' where operation_key = 'b-1';
select is((select status || '/' || name from public.projects where operation_key = 'b-1'), 'published/Residencial renombrada',
  'lo vuelve a publicar y lo corrige');
select set_config('role', 'postgres', true), set_config('request.jwt.claims', '', true);

-- Otra inmobiliaria no ve el borrador ajeno ni cambia el proyecto de otra.
select pg_temp.as_account('62222222-2222-4222-8222-222222222222');
update public.projects set name = 'Ajena' where operation_key = 'b-1';
delete from public.projects where operation_key = 'b-1';
select set_config('role', 'postgres', true), set_config('request.jwt.claims', '', true);
select is((select name from public.projects where operation_key = 'b-1'), 'Residencial renombrada',
  'otra cuenta no cambia ni borra el proyecto ajeno');

-- Una cuenta sin plan de inmobiliaria no publica proyectos.
select pg_temp.as_account('63333333-3333-4333-8333-333333333333');
select throws_ok($$ select pg_temp.save('p-1', '63333333-3333-4333-8333-333333333333/p-1/0.webp') $$,
  'RZ001', null, 'sin plan de inmobiliaria no se publica ningún proyecto');
select set_config('role', 'postgres', true), set_config('request.jwt.claims', '', true);

-- Lo que oculta el equipo sigue oculto aunque la inmobiliaria intente publicarlo.
update public.projects set status = 'hidden' where operation_key = 'b-1';
select pg_temp.as_account('61111111-1111-4111-8111-111111111111');
update public.projects set status = 'published' where operation_key = 'b-1';
select is((select status from public.projects where operation_key = 'b-1'), 'hidden', 'no se vuelve a publicar lo que ocultó el equipo');
select set_config('role', 'postgres', true), set_config('request.jwt.claims', '', true);

-- El equipo fija los dos límites en un paso, y queda en el registro.
select pg_temp.as_account('64444444-4444-4444-8444-444444444444');
select lives_ok($$ select public.admin_set_account_limits('63333333-3333-4333-8333-333333333333', 150, 3, 'Plan Plus') $$,
  'el equipo activa un plan de inmobiliaria');
select is(
  (select max_projects || '/' || project_count from public.admin_list_accounts('particular.b') limit 1),
  '3/0', 'el panel muestra cuántos proyectos admite y tiene');
select set_config('role', 'postgres', true), set_config('request.jwt.claims', '', true);
select is((select max_publications || '/' || max_projects from public.profiles where id = '63333333-3333-4333-8333-333333333333'),
  '150/3', 'la cuenta queda con los dos límites');

select * from finish();
rollback;
