-- Permisos de los anuncios y de sus fotos: lo que cada quien puede ver, publicar, corregir y borrar.
-- Se ejecuta con `supabase test db` contra un Supabase local con todas las migraciones (ver el README).
-- Todo ocurre dentro de una transacción que se deshace al final: no deja nada en la base.
begin;

select plan(22);

-- Tres cuentas: dos que publican y una que solo mira.
insert into auth.users (id, email, raw_user_meta_data)
values
  ('11111111-1111-4111-8111-111111111111', 'ana@prueba.hn', '{"first_name":"Ana","last_name":"Mejía","phone":"+50499998888"}'),
  ('22222222-2222-4222-8222-222222222222', 'beto@prueba.hn', '{"first_name":"Beto","last_name":"Paz","phone":"+50433337777"}'),
  ('33333333-3333-4333-8333-333333333333', 'caro@prueba.hn', '{"first_name":"Caro","last_name":"Rosa","phone":"+50422226666"}');

-- Actuar como una cuenta, o como un visitante sin sesión.
create function pg_temp.as_user(account uuid) returns void language sql as $$
  select set_config('role', 'authenticated', true),
         set_config('request.jwt.claims', json_build_object('sub', account, 'role', 'authenticated')::text, true);
$$;
create function pg_temp.as_visitor() returns void language sql as $$
  select set_config('role', 'anon', true), set_config('request.jwt.claims', '{"role":"anon"}', true);
$$;
create function pg_temp.as_postgres() returns void language sql as $$
  select set_config('role', 'postgres', true), set_config('request.jwt.claims', '', true);
$$;

-- Un anuncio válido de la cuenta que tiene la sesión, con la clave de operación indicada.
create function pg_temp.publish(account uuid, key text) returns uuid language sql as $$
  insert into public.properties (
    operation_key, title, description, type, operation, price, department, city, neighborhood, address,
    latitude, longitude, built_area, land_area, bedrooms, bathrooms, parking, photos
  ) values (
    key, 'Casa amplia con patio en Palmira', 'Tres habitaciones, jardín y cochera para dos carros, cerca del bulevar.',
    'casa', 'venta', 185000, 'francisco-morazan', 'Tegucigalpa (Distrito Central)', 'Colonia Palmira', 'Avenida República de Chile',
    14.0889, -87.1921, 180, 300, 3, 2, 2, array[account::text || '/' || key || '/0.webp']
  ) returning id
$$;

grant execute on all functions in schema pg_temp to anon, authenticated;

-- Ana publica un anuncio.
select pg_temp.as_user('11111111-1111-4111-8111-111111111111');
select lives_ok($$ select pg_temp.publish('11111111-1111-4111-8111-111111111111', 'clave-ana-1') $$,
  'una cuenta publica su primer anuncio');

select is(
  (select owner_id from public.properties where operation_key = 'clave-ana-1'),
  '11111111-1111-4111-8111-111111111111'::uuid,
  'el anuncio queda a nombre de quien tiene la sesión');

select is(
  (select advertiser_name || ' / ' || advertiser_phone from public.properties where operation_key = 'clave-ana-1'),
  'Ana Mejía / +50499998888',
  'el nombre y el teléfono del anuncio los copia el servidor del perfil');

select throws_ok($$ select pg_temp.publish('11111111-1111-4111-8111-111111111111', 'clave-ana-2') $$,
  'RZ001', null, 'el plan gratuito no deja publicar un segundo anuncio');

-- Nadie publica a nombre de otro: ni cambiando el dueño ni con fotos de otra carpeta.
select throws_ok($$
  insert into public.properties (
    owner_id, operation_key, title, description, type, operation, price, department, city, neighborhood, address,
    latitude, longitude, built_area, land_area, bedrooms, bathrooms, parking, photos
  ) values (
    '22222222-2222-4222-8222-222222222222', 'clave-falsa', 'Casa amplia con patio en Palmira',
    'Tres habitaciones, jardín y cochera para dos carros, cerca del bulevar.', 'casa', 'venta', 185000,
    'francisco-morazan', 'Tegucigalpa (Distrito Central)', 'Colonia Palmira', 'Avenida República de Chile', 14.0889, -87.1921,
    180, 300, 3, 2, 2, array['22222222-2222-4222-8222-222222222222/clave-falsa/0.webp'])
$$, null, null, 'nadie publica un anuncio a nombre de otra cuenta');

select pg_temp.as_user('22222222-2222-4222-8222-222222222222');
select throws_ok($$
  insert into public.properties (
    operation_key, title, description, type, operation, price, department, city, neighborhood, address,
    latitude, longitude, built_area, land_area, bedrooms, bathrooms, parking, photos
  ) values (
    'clave-beto', 'Casa amplia con patio en Palmira',
    'Tres habitaciones, jardín y cochera para dos carros, cerca del bulevar.', 'casa', 'venta', 185000,
    'francisco-morazan', 'Tegucigalpa (Distrito Central)', 'Colonia Palmira', 'Avenida República de Chile', 14.0889, -87.1921,
    180, 300, 3, 2, 2, array['11111111-1111-4111-8111-111111111111/clave-ana-1/0.webp'])
$$, 'RZ002', null, 'un anuncio no puede usar las fotos de la carpeta de otra cuenta');

-- Lo que ve cada quien.
select pg_temp.as_visitor();
select is((select count(*)::int from public.properties), 1, 'un visitante ve los anuncios publicados');

select pg_temp.as_user('11111111-1111-4111-8111-111111111111');
update public.properties set status = 'unpublished' where operation_key = 'clave-ana-1';
select is((select status from public.properties where operation_key = 'clave-ana-1'), 'unpublished',
  'quien publicó puede despublicar su anuncio');

select pg_temp.as_visitor();
select is((select count(*)::int from public.properties), 0, 'un visitante no ve un anuncio despublicado');

select pg_temp.as_user('22222222-2222-4222-8222-222222222222');
select is((select count(*)::int from public.properties), 0, 'otra cuenta no ve un anuncio despublicado ajeno');

select pg_temp.as_user('11111111-1111-4111-8111-111111111111');
select is((select count(*)::int from public.properties), 1, 'quien lo publicó sigue viendo su anuncio despublicado');

update public.properties set status = 'published' where operation_key = 'clave-ana-1';

-- Lo que nadie puede hacer con un anuncio ajeno, ni con el propio más allá de lo permitido.
select pg_temp.as_user('22222222-2222-4222-8222-222222222222');
update public.properties set title = 'Título cambiado por otra cuenta' where operation_key = 'clave-ana-1';
delete from public.properties where operation_key = 'clave-ana-1';
select pg_temp.as_postgres();
select is((select title from public.properties where operation_key = 'clave-ana-1'), 'Casa amplia con patio en Palmira',
  'otra cuenta no puede corregir un anuncio ajeno');
select is((select count(*)::int from public.properties where operation_key = 'clave-ana-1'), 1,
  'otra cuenta no puede borrar un anuncio ajeno');

select pg_temp.as_visitor();
update public.properties set title = 'Título cambiado sin sesión' where operation_key = 'clave-ana-1';
select pg_temp.as_postgres();
select is((select title from public.properties where operation_key = 'clave-ana-1'), 'Casa amplia con patio en Palmira',
  'un visitante no puede corregir anuncios');

select pg_temp.as_user('11111111-1111-4111-8111-111111111111');
update public.properties set status = 'hidden' where operation_key = 'clave-ana-1';
update public.properties set advertiser_phone = '+50488887777' where operation_key = 'clave-ana-1';
update public.properties set owner_id = '22222222-2222-4222-8222-222222222222' where operation_key = 'clave-ana-1';
select pg_temp.as_postgres();
select is((select status from public.properties where operation_key = 'clave-ana-1'), 'published',
  'quien publicó no puede ocultar su anuncio como si fuera el equipo');
select is((select advertiser_phone from public.properties where operation_key = 'clave-ana-1'), '+50499998888',
  'quien publicó no puede poner en el anuncio otro teléfono que el de su perfil');
select is((select owner_id from public.properties where operation_key = 'clave-ana-1'), '11111111-1111-4111-8111-111111111111'::uuid,
  'un anuncio no puede pasar a otra cuenta');

select pg_temp.as_user('11111111-1111-4111-8111-111111111111');
select throws_ok($$ update public.properties set price = 0 where operation_key = 'clave-ana-1' $$,
  null, null, 'el servidor rechaza un precio que no es válido');

-- Las fotos: cada cuenta solo sube a su carpeta.
select pg_temp.as_user('22222222-2222-4222-8222-222222222222');
select throws_ok($$
  insert into storage.objects (bucket_id, name, owner_id)
  values ('property-photos', '11111111-1111-4111-8111-111111111111/intruso/0.webp', '22222222-2222-4222-8222-222222222222')
$$, '42501', null, 'nadie sube fotos a la carpeta de otra cuenta');
select lives_ok($$
  insert into storage.objects (bucket_id, name, owner_id)
  values ('property-photos', '22222222-2222-4222-8222-222222222222/propia/0.webp', '22222222-2222-4222-8222-222222222222')
$$, 'cada cuenta sube fotos a su propia carpeta');

select pg_temp.as_visitor();
select throws_ok($$
  insert into storage.objects (bucket_id, name) values ('property-photos', 'anonimo/0.webp')
$$, '42501', null, 'un visitante no sube fotos');

-- Borrar el propio anuncio sí se puede.
select pg_temp.as_user('11111111-1111-4111-8111-111111111111');
delete from public.properties where operation_key = 'clave-ana-1';
select pg_temp.as_postgres();
select is((select count(*)::int from public.properties where operation_key = 'clave-ana-1'), 0,
  'quien publicó puede borrar su anuncio');

select * from finish();
rollback;
