-- Cotizar un proyecto: lo que reserva la función `contact-publisher` antes de mandar el correo a la
-- inmobiliaria. Se ejecuta con `supabase test db`.
begin;

select plan(7);

insert into auth.users (id, email) values ('91111111-1111-4111-8111-111111111111', 'ventas.torre@prueba.hn');
insert into public.projects (
  id, owner_id, status, name, developer_name, description, kind, stage, price_from,
  department, city, neighborhood, address, latitude, longitude, photos
) values
  ('9a000000-0000-4000-8000-000000000001', '91111111-1111-4111-8111-111111111111', 'published', 'Torre a cotizar',
   'Constructora Norte', 'Torre de apartamentos con piscina y gimnasio, a minutos del centro.', 'torre', 'preventa', 90000,
   'cortes', 'San Pedro Sula', 'Colonia Trejo', '10 calle', 15.5, -88.0, array['91111111-1111-4111-8111-111111111111/a/0.webp']),
  ('9a000000-0000-4000-8000-000000000002', '91111111-1111-4111-8111-111111111111', 'draft', 'Torre en borrador',
   'Constructora Norte', 'Torre de apartamentos con piscina y gimnasio, a minutos del centro.', 'torre', 'preventa', 90000,
   'cortes', 'San Pedro Sula', 'Colonia Trejo', '10 calle', 15.5, -88.0, array['91111111-1111-4111-8111-111111111111/b/0.webp']);

set local role service_role;
select is(
  (select outcome || '/' || owner_email || '/' || publisher_name || '/' || project_name
   from public.claim_project_contact('9a000000-0000-4000-8000-000000000001', 'cotizacion-1', 'huella')),
  'claimed/ventas.torre@prueba.hn/Constructora Norte/Torre a cotizar',
  'reserva el envío y entrega el correo de la inmobiliaria, su desarrolladora y el proyecto');
select is(
  (select outcome from public.claim_project_contact('9a000000-0000-4000-8000-000000000001', 'cotizacion-1', 'huella')),
  'already_sent', 'con la misma clave no se manda otro correo');
select throws_ok(
  $$ select * from public.claim_project_contact('9a000000-0000-4000-8000-000000000002', 'cotizacion-2', 'huella') $$,
  'RZ003', null, 'un borrador no se cotiza: nadie lo ve');
select lives_ok($$ select public.release_publisher_contact('cotizacion-1') $$, 'si el correo no salió, la reserva se libera');
select is(
  (select outcome from public.claim_project_contact('9a000000-0000-4000-8000-000000000001', 'cotizacion-1', 'otra-huella')),
  'claimed', 'y el reintento vuelve a reservarlo');
reset role;
select is((select count(*)::int from public.publisher_contacts where project_id = '9a000000-0000-4000-8000-000000000001'), 1,
  'queda registrado qué envío se hizo, por el proyecto y no por un anuncio');

set local role anon;
select throws_ok(
  $$ select * from public.claim_project_contact('9a000000-0000-4000-8000-000000000001', 'cotizacion-3', 'huella') $$,
  '42501', null, 'el navegador no puede pedir el correo de la inmobiliaria');

select * from finish();
rollback;
