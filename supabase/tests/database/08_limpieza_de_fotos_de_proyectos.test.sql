-- Qué fotos de proyectos cuenta como huérfanas la limpieza diaria (decide qué se borra). Se ejecuta con
-- `supabase test db`.
begin;

select plan(5);

insert into auth.users (id, email) values ('81111111-1111-4111-8111-111111111111', 'inmobiliaria.fotos@prueba.hn');

insert into public.projects (
  owner_id, status, name, developer_name, description, kind, stage, price_from,
  department, city, neighborhood, address, latitude, longitude, photos
) values (
  '81111111-1111-4111-8111-111111111111', 'draft', 'Torre con fotos', 'Constructora',
  'Torre de apartamentos con piscina y gimnasio, a minutos del centro.', 'torre', 'preventa', 90000,
  'cortes', 'San Pedro Sula', 'Colonia Trejo', '10 calle', 15.5, -88.0,
  array['81111111-1111-4111-8111-111111111111/torre/0.webp', 'https://fotos.example/render.webp']
);

insert into storage.objects (bucket_id, name, created_at, updated_at) values
  ('project-photos', '81111111-1111-4111-8111-111111111111/torre/0.webp', now() - interval '3 days', now() - interval '3 days'),
  ('project-photos', '81111111-1111-4111-8111-111111111111/vieja/0.webp', now() - interval '2 days', now() - interval '2 days'),
  ('project-photos', '81111111-1111-4111-8111-111111111111/en-curso/0.webp', now() - interval '10 minutes', now() - interval '10 minutes'),
  ('property-photos', '81111111-1111-4111-8111-111111111111/anuncio/0.webp', now() - interval '9 days', now() - interval '9 days');

set local role service_role;
-- Solo se miran las fotos de esta prueba: en tu equipo puede haber otras de ejecuciones anteriores.
select is(
  array(select name from public.orphan_project_photos() where name like '81111111-%'),
  array['81111111-1111-4111-8111-111111111111/vieja/0.webp'],
  'solo cuenta como huérfana la foto vieja que no usa ningún proyecto, aunque el proyecto esté en borrador');
select is(public.count_orphan_project_photos(), (select count(*) from public.orphan_project_photos()),
  'el modo de prueba cuenta las mismas');
select is((select count(*)::int from public.orphan_project_photos(interval '1 minute') where name like '81111111-%'), 1,
  'aunque se pida menos margen, nunca baja de una hora');

-- Al borrar el proyecto, sus fotos pasan a sobrar.
reset role;
delete from public.projects where name = 'Torre con fotos';
set local role service_role;
select is((select count(*)::int from public.orphan_project_photos() where name like '81111111-%'), 2,
  'las fotos de un proyecto borrado pasan a sobrar');

reset role;
set local role anon;
select throws_ok($$ select * from public.orphan_project_photos() $$, '42501', null, 'un visitante no sabe qué fotos sobran');

select * from finish();
rollback;
