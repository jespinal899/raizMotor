-- Qué anuncios salen como destacados en la portada: solo los publicados de cuentas con un plan de pago, como
-- mucho 2 por cuenta. Se ejecuta con `supabase test db`.
begin;

select plan(7);

-- Ana tiene el plan gratis; Beto y Carla, uno de pago.
insert into auth.users (id, email) values
  ('41111111-1111-4111-8111-111111111111', 'ana.destacadas@prueba.hn'),
  ('42222222-2222-4222-8222-222222222222', 'beto.destacadas@prueba.hn'),
  ('43333333-3333-4333-8333-333333333333', 'carla.destacadas@prueba.hn');
update public.profiles set max_publications = 25
where id in ('42222222-2222-4222-8222-222222222222', '43333333-3333-4333-8333-333333333333');

-- Publica un anuncio con la sesión de `owner`.
create function pg_temp.publish(owner uuid, key text) returns void language plpgsql as $$
begin
  perform set_config('role', 'authenticated', true),
          set_config('request.jwt.claims', json_build_object('sub', owner, 'role', 'authenticated')::text, true);
  insert into public.properties (
    operation_key, title, description, type, operation, price, department, city, neighborhood, address,
    latitude, longitude, built_area, land_area, bedrooms, bathrooms, parking, photos
  ) values (
    key, 'Casa amplia con patio en Palmira', 'Tres habitaciones, jardín y cochera para dos carros, cerca del bulevar.',
    'casa', 'venta', 185000, 'francisco-morazan', 'Tegucigalpa (Distrito Central)', 'Colonia Palmira', 'Avenida República de Chile',
    14.0889, -87.1921, 180, 300, 3, 2, 2, array[owner::text || '/' || key || '/0.webp']
  );
  perform set_config('role', 'postgres', true), set_config('request.jwt.claims', '', true);
end;
$$;

select pg_temp.publish('41111111-1111-4111-8111-111111111111', 'gratis-1');
select pg_temp.publish('42222222-2222-4222-8222-222222222222', 'beto-1');
select pg_temp.publish('42222222-2222-4222-8222-222222222222', 'beto-2');
select pg_temp.publish('42222222-2222-4222-8222-222222222222', 'beto-3');
select pg_temp.publish('43333333-3333-4333-8333-333333333333', 'carla-1');
select pg_temp.publish('43333333-3333-4333-8333-333333333333', 'carla-2');
update public.properties set status = 'unpublished' where operation_key = 'carla-1';
update public.properties set status = 'hidden' where operation_key = 'carla-2';

-- Lo que ve un visitante sin cuenta.
set local role anon;

select is(
  (select count(*)::int from public.featured_properties(24) where owner_id = '41111111-1111-4111-8111-111111111111'),
  0, 'un anuncio del plan gratis nunca sale destacado');
select is(
  (select count(*)::int from public.featured_properties(24) where owner_id = '42222222-2222-4222-8222-222222222222'),
  2, 'de una cuenta de pago salen como mucho 2 anuncios');
select is(
  (select count(*)::int from public.featured_properties(24) where owner_id = '43333333-3333-4333-8333-333333333333'),
  0, 'ni lo despublicado por su dueño ni lo oculto por el equipo sale destacado');
select is((select count(*)::int from public.featured_properties(1)), 1, 'entrega como mucho la cantidad pedida');
select is(
  array(select id from public.featured_properties(24)),
  array(select id from public.featured_properties(24)),
  'en la misma hora el orden es siempre el mismo');
select is((select count(*)::int from public.profiles), 0,
  'un visitante sigue sin poder leer los perfiles, ni el plan de nadie');

-- Si el plan se baja al gratis, sus anuncios dejan de salir.
reset role;
update public.profiles set max_publications = 1 where id = '42222222-2222-4222-8222-222222222222';
set local role anon;
select is(
  (select count(*)::int from public.featured_properties(24) where owner_id = '42222222-2222-4222-8222-222222222222'),
  0, 'al bajar al plan gratis, la cuenta deja de salir destacada');

select * from finish();
rollback;
