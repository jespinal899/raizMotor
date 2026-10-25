-- Una cuenta del equipo publica proyectos desde el sitio, sin decir de quién son, como cualquier inmobiliaria.
-- Se ejecuta con `supabase test db`.
begin;

select plan(4);

insert into auth.users (id, email) values
  ('71111111-1111-4111-8111-111111111111', 'equipo.c@prueba.hn'),
  ('72222222-2222-4222-8222-222222222222', 'inmobiliaria.c@prueba.hn');
update public.profiles set role = 'admin' where id = '71111111-1111-4111-8111-111111111111';

select set_config('role', 'authenticated', true),
       set_config('request.jwt.claims', json_build_object('sub', '71111111-1111-4111-8111-111111111111', 'role', 'authenticated')::text, true);

-- Lo que envía el sitio: sin dueño ni estado, con su clave de operación.
select lives_ok($$
  insert into public.projects (
    operation_key, name, developer_name, description, kind, stage, price_from,
    department, city, neighborhood, address, latitude, longitude, photos
  ) values (
    'c-1', 'Torre del equipo', 'Equipo DomusRaíz',
    'Torre de apartamentos con piscina, gimnasio y seguridad, cerca del centro de la ciudad.',
    'torre', 'preventa', 120000, 'cortes', 'San Pedro Sula', 'Colonia Trejo', '10 calle',
    15.5042, -88.025, array['71111111-1111-4111-8111-111111111111/c-1/0.webp']
  )
  on conflict (owner_id, operation_key) do nothing
$$, 'el equipo publica un proyecto desde el sitio');

select is((select owner_id::text || '/' || status from public.projects where operation_key = 'c-1'),
  '71111111-1111-4111-8111-111111111111/published', 'queda a su nombre y publicado');

-- Lo que carga el equipo a nombre de otra cuenta, sin clave (como desde el panel): con el dueño y el estado que diga.
select lives_ok($$
  insert into public.projects (
    owner_id, status, name, developer_name, description, kind, stage, price_from,
    department, city, neighborhood, address, latitude, longitude, photos
  ) values (
    '72222222-2222-4222-8222-222222222222', 'draft', 'Residencial a nombre de otra', 'Inmobiliaria C',
    'Residencial cerrada con áreas verdes, parque y seguridad, a pocos minutos del centro.',
    'residencial', 'construccion', 80000, 'cortes', 'San Pedro Sula', 'Colonia Trejo', '10 calle',
    15.5042, -88.025, array['torre-vista/portada.webp']
  )
$$, 'el equipo carga un proyecto a nombre de una inmobiliaria');

select is((select owner_id::text || '/' || status from public.projects where name = 'Residencial a nombre de otra'),
  '72222222-2222-4222-8222-222222222222/draft', 'conserva el dueño y el estado que escribió el equipo');

select * from finish();
rollback;
