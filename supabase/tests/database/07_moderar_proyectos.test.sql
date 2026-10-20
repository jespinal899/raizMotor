-- Moderar proyectos: reportarlos desde su ficha y que el equipo los oculte o los devuelva al catálogo.
-- Se ejecuta con `supabase test db`.
begin;

select plan(12);

insert into auth.users (id, email) values
  ('71111111-1111-4111-8111-111111111111', 'inmobiliaria.reportada@prueba.hn'),
  ('72222222-2222-4222-8222-222222222222', 'curioso.reporta@prueba.hn'),
  ('73333333-3333-4333-8333-333333333333', 'equipo.moderacion@prueba.hn');
update public.profiles set max_projects = 3 where id = '71111111-1111-4111-8111-111111111111';
update public.profiles set role = 'admin' where id = '73333333-3333-4333-8333-333333333333';

insert into public.projects (
  id, owner_id, status, name, developer_name, description, kind, stage, price_from,
  department, city, neighborhood, address, latitude, longitude, photos
) values
  ('7a000000-0000-4000-8000-000000000001', '71111111-1111-4111-8111-111111111111', 'published', 'Torre reportada',
   'Constructora', 'Torre de apartamentos con piscina y gimnasio, a minutos del centro.', 'torre', 'preventa', 90000,
   'cortes', 'San Pedro Sula', 'Colonia Trejo', '10 calle', 15.5, -88.0, array['71111111-1111-4111-8111-111111111111/a/0.webp']),
  ('7a000000-0000-4000-8000-000000000002', '71111111-1111-4111-8111-111111111111', 'draft', 'Torre en borrador',
   'Constructora', 'Torre de apartamentos con piscina y gimnasio, a minutos del centro.', 'torre', 'preventa', 90000,
   'cortes', 'San Pedro Sula', 'Colonia Trejo', '10 calle', 15.5, -88.0, array['71111111-1111-4111-8111-111111111111/b/0.webp']);

create function pg_temp.as_account(account uuid) returns void language sql as $$
  select set_config('role', 'authenticated', true),
         set_config('request.jwt.claims', json_build_object('sub', account, 'role', 'authenticated')::text, true);
$$;

-- Un visitante sin cuenta reporta el proyecto publicado.
set local role anon;
select lives_ok(
  $$ select public.report_project('7a000000-0000-4000-8000-000000000001', 'fraud', 'Piden la prima por adelantado', 'reporte-1') $$,
  'un visitante reporta un proyecto publicado');
select lives_ok(
  $$ select public.report_project('7a000000-0000-4000-8000-000000000001', 'fraud', 'Piden la prima por adelantado', 'reporte-1') $$,
  'repetir el envío no falla');
select throws_ok(
  $$ select public.report_project('7a000000-0000-4000-8000-000000000002', 'fraud', '', 'reporte-2') $$,
  'RZ003', null, 'un borrador no se reporta: nadie lo ve');
select throws_ok(
  $$ select public.report_project('7a000000-0000-4000-8000-000000000001', 'other', '', 'reporte-3') $$,
  'RZ002', null, 'con «Otro motivo» hay que contar qué pasa');
reset role;
select is((select count(*)::int from public.property_reports where project_id = '7a000000-0000-4000-8000-000000000001'), 1,
  'queda un solo reporte, del proyecto y no de un anuncio');
select is((select count(*)::int from public.property_reports where property_id is null and project_id is null), 0,
  'ningún reporte queda sin anuncio ni proyecto');

-- Quien no es del equipo no modera.
select pg_temp.as_account('72222222-2222-4222-8222-222222222222');
select throws_ok(
  $$ select public.admin_set_project_status('7a000000-0000-4000-8000-000000000001', 'hidden', '') $$,
  '42501', null, 'una cuenta cualquiera no oculta proyectos');
select set_config('role', 'postgres', true), set_config('request.jwt.claims', '', true);

-- El equipo oculta el proyecto desde el reporte.
select pg_temp.as_account('73333333-3333-4333-8333-333333333333');
select lives_ok(
  $$ select public.admin_review_report((select id from public.property_reports where operation_key = 'reporte-1'), 'hide_property', 'Fraude') $$,
  'el equipo oculta el proyecto reportado');
select set_config('role', 'postgres', true), set_config('request.jwt.claims', '', true);
select is(
  (select p.status || '/' || r.status from public.projects p join public.property_reports r on r.project_id = p.id
   where r.operation_key = 'reporte-1'),
  'hidden/resolved', 'el proyecto queda oculto y el reporte resuelto');

-- Y lo devuelve al catálogo; lo que la inmobiliaria dejó en borrador no lo publica el equipo.
select pg_temp.as_account('73333333-3333-4333-8333-333333333333');
select lives_ok($$ select public.admin_set_project_status('7a000000-0000-4000-8000-000000000001', 'published', 'Era un error') $$,
  'el equipo devuelve al catálogo un proyecto oculto');
select throws_ok($$ select public.admin_set_project_status('7a000000-0000-4000-8000-000000000002', 'published', '') $$,
  'RZ002', null, 'pero no publica un borrador de la inmobiliaria');
select set_config('role', 'postgres', true), set_config('request.jwt.claims', '', true);
select is(
  (select array_agg(action order by id) from public.moderation_log where project_id = '7a000000-0000-4000-8000-000000000001'),
  array['report_hide_property', 'restore_project'], 'cada decisión queda en el registro, con su proyecto');

select * from finish();
rollback;
