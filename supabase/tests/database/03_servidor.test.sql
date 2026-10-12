-- Lo que usan las funciones del servidor con la clave de servicio: qué fotos cuenta como huérfanas la limpieza
-- (decide qué se borra) y cómo se reserva un contacto al publicador. Se ejecuta con `supabase test db`.
begin;

select plan(11);

insert into auth.users (id, email, raw_user_meta_data)
values ('11111111-1111-4111-8111-111111111111', 'ana@prueba.hn', '{"first_name":"Ana","last_name":"Mejía","phone":"+50499998888"}');

select set_config('role', 'authenticated', true),
       set_config('request.jwt.claims', '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}', true);
insert into public.properties (
  operation_key, title, description, type, operation, price, department, city, neighborhood, address,
  latitude, longitude, built_area, land_area, bedrooms, bathrooms, parking, photos
) values (
  'clave-ana', 'Casa amplia con patio en Palmira', 'Tres habitaciones, jardín y cochera para dos carros, cerca del bulevar.',
  'casa', 'venta', 185000, 'francisco-morazan', 'Tegucigalpa (Distrito Central)', 'Colonia Palmira', 'Avenida República de Chile',
  14.0889, -87.1921, 180, 300, 3, 2, 2,
  array['11111111-1111-4111-8111-111111111111/clave-ana/0.webp', '11111111-1111-4111-8111-111111111111/clave-ana/1.webp']
);
select set_config('role', 'postgres', true), set_config('request.jwt.claims', '', true);

-- Fotos en el depósito: dos del anuncio, una vieja sin anuncio, una reciente sin anuncio y una de otro depósito.
insert into storage.buckets (id, name) values ('otro-deposito', 'otro-deposito') on conflict do nothing;
insert into storage.objects (bucket_id, name, created_at, updated_at) values
  ('property-photos', '11111111-1111-4111-8111-111111111111/clave-ana/0.webp', now() - interval '3 days', now() - interval '3 days'),
  ('property-photos', '11111111-1111-4111-8111-111111111111/clave-ana/1.webp', now() - interval '3 days', now() - interval '3 days'),
  ('property-photos', '11111111-1111-4111-8111-111111111111/abandonada/0.webp', now() - interval '2 days', now() - interval '2 days'),
  ('property-photos', '11111111-1111-4111-8111-111111111111/en-curso/0.webp', now() - interval '10 minutes', now() - interval '10 minutes'),
  ('property-photos', '11111111-1111-4111-8111-111111111111/reemplazada/0.webp', now() - interval '3 days', now() - interval '5 minutes'),
  ('otro-deposito', 'suelta.webp', now() - interval '9 days', now() - interval '9 days');

set local role service_role;

select is(
  array(select name from public.orphan_photos()),
  array['11111111-1111-4111-8111-111111111111/abandonada/0.webp'],
  'solo cuenta como huérfana la foto vieja que no usa ningún anuncio');
select is(public.count_orphan_photos(), 1::bigint, 'el modo de prueba cuenta las mismas');
select is((select count(*)::int from public.orphan_photos(interval '1 minute')), 1,
  'aunque se pida menos margen, nunca baja de una hora');
select is((select count(*)::int from public.orphan_photos(interval '24 hours', 0)), 1, 'siempre entrega al menos una por tanda');

-- Si el anuncio se despublica o lo oculta el equipo, sus fotos siguen siendo suyas.
reset role;
update public.properties set status = 'hidden' where operation_key = 'clave-ana';
set local role service_role;
select is(public.count_orphan_photos(), 1::bigint, 'las fotos de un anuncio oculto no son huérfanas');

-- Al borrar el anuncio, sus fotos pasan a sobrar.
reset role;
delete from public.properties where operation_key = 'clave-ana';
set local role service_role;
select is(public.count_orphan_photos(), 3::bigint, 'las fotos de un anuncio borrado pasan a sobrar');

-- Contacto al publicador: se reserva una vez por clave y solo sobre anuncios publicados.
reset role;
select set_config('role', 'authenticated', true),
       set_config('request.jwt.claims', '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}', true);
insert into public.properties (
  operation_key, title, description, type, operation, price, department, city, neighborhood, address,
  latitude, longitude, built_area, land_area, bedrooms, bathrooms, parking, photos
) values (
  'clave-ana-2', 'Casa amplia con patio en Palmira', 'Tres habitaciones, jardín y cochera para dos carros, cerca del bulevar.',
  'casa', 'venta', 185000, 'francisco-morazan', 'Tegucigalpa (Distrito Central)', 'Colonia Palmira', 'Avenida República de Chile',
  14.0889, -87.1921, 180, 300, 3, 2, 2, array['11111111-1111-4111-8111-111111111111/clave-ana-2/0.webp']
);
select set_config('role', 'postgres', true), set_config('request.jwt.claims', '', true);
create temp table ids as select id as property from public.properties where operation_key = 'clave-ana-2';
grant select on ids to service_role;

set local role service_role;
select is(
  (select outcome || '/' || owner_email from public.claim_publisher_contact((select property from ids), 'contacto-1', 'huella')),
  'claimed/ana@prueba.hn', 'la primera vez reserva el envío y entrega el correo del publicador');
select is(
  (select outcome from public.claim_publisher_contact((select property from ids), 'contacto-1', 'huella')),
  'already_sent', 'con la misma clave no se manda otro correo');
select lives_ok($$ select public.release_publisher_contact('contacto-1') $$, 'si el correo no salió, la reserva se libera');
select is(
  (select outcome from public.claim_publisher_contact((select property from ids), 'contacto-1', 'huella')),
  'claimed', 'y el reintento vuelve a reservarlo');

reset role;
update public.properties set status = 'unpublished' where operation_key = 'clave-ana-2';
set local role service_role;
select throws_ok($$ select * from public.claim_publisher_contact((select property from ids), 'contacto-2', 'huella') $$,
  'RZ003', null, 'no se contacta por un anuncio que no está publicado');

select * from finish();
rollback;
