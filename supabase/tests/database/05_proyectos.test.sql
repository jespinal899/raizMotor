-- Proyectos: quién los ve y quién los gestiona, y cuáles se destacan en la portada. Se ejecuta con
-- `supabase test db`.
begin;

select plan(12);

-- Una inmobiliaria con plan de pago, una con el plan gratis, una cuenta cualquiera y una del equipo.
insert into auth.users (id, email) values
  ('51111111-1111-4111-8111-111111111111', 'inmobiliaria.pago@prueba.hn'),
  ('52222222-2222-4222-8222-222222222222', 'inmobiliaria.gratis@prueba.hn'),
  ('53333333-3333-4333-8333-333333333333', 'curioso@prueba.hn'),
  ('54444444-4444-4444-8444-444444444444', 'equipo.proyectos@prueba.hn');
update public.profiles set max_publications = 25 where id = '51111111-1111-4111-8111-111111111111';
update public.profiles set role = 'admin' where id = '54444444-4444-4444-8444-444444444444';

-- Un proyecto de `owner` con ese nombre y estado, cargado por el equipo.
create function pg_temp.project(owner uuid, project_name text, project_status text) returns uuid language sql as $$
  insert into public.projects (
    owner_id, status, name, developer_name, developer_phone, description, kind, stage, delivery_date, price_from,
    units_total, department, city, neighborhood, address, latitude, longitude, amenities, photos
  ) values (
    owner, project_status, project_name, 'Constructora de prueba', '+50499998888',
    'Torre de apartamentos con piscina, gimnasio y seguridad todo el día, a minutos del bulevar.',
    'torre', 'preventa', '2027-12-01', 95000, 80, 'francisco-morazan', 'Tegucigalpa (Distrito Central)',
    'Colonia Lomas del Guijarro', 'Calle principal', 14.0889, -87.1921, array['Piscina'], array['portada.webp']
  ) returning id
$$;

select pg_temp.project('51111111-1111-4111-8111-111111111111', 'Torre de pago 1', 'published');
select pg_temp.project('51111111-1111-4111-8111-111111111111', 'Torre de pago 2', 'published');
select pg_temp.project('51111111-1111-4111-8111-111111111111', 'Torre de pago 3', 'published');
select pg_temp.project('51111111-1111-4111-8111-111111111111', 'Torre en borrador', 'draft');
select pg_temp.project('52222222-2222-4222-8222-222222222222', 'Torre gratis', 'published');
insert into public.project_models (project_id, name, bedrooms, bathrooms, area, price_from)
select id, 'Modelo A', 2, 2, 85, 95000 from public.projects where name in ('Torre de pago 1', 'Torre en borrador');

-- Un visitante sin cuenta.
set local role anon;
select is((select count(*)::int from public.projects where name like 'Torre%'), 4, 've los proyectos publicados');
select is((select count(*)::int from public.projects where name = 'Torre en borrador'), 0, 'no ve un borrador');
select is(
  (select count(*)::int from public.project_models m join public.projects p on p.id = m.project_id where p.name like 'Torre%'),
  1, 'solo ve los modelos de los proyectos publicados');
select is(
  (select count(*)::int from public.featured_projects(24) where owner_id = '51111111-1111-4111-8111-111111111111'),
  2, 'de una cuenta de pago se destacan como mucho 2 proyectos');
select is(
  (select count(*)::int from public.featured_projects(24) where owner_id = '52222222-2222-4222-8222-222222222222'),
  0, 'un proyecto de una cuenta con el plan gratis no se destaca');
select is((select count(*)::int from public.featured_projects(1)), 1, 'entrega como mucho la cantidad pedida');
select throws_ok($$ update public.projects set name = 'Cambiado' $$, '42501', null, 'no puede cambiar ningún proyecto');
reset role;

-- Una cuenta cualquiera, aunque tenga sesión.
select set_config('role', 'authenticated', true),
       set_config('request.jwt.claims', '{"sub":"53333333-3333-4333-8333-333333333333","role":"authenticated"}', true);
update public.projects set name = 'Cambiado' where name = 'Torre de pago 1';
select is((select count(*)::int from public.projects where name = 'Cambiado'), 0, 'una cuenta que no es del equipo no cambia proyectos');
select throws_ok(
  $$ select pg_temp.project('53333333-3333-4333-8333-333333333333', 'Torre ajena', 'published') $$,
  'RZ001', null, 'ni los crea: sin plan de inmobiliaria no admite ningún proyecto');
select set_config('role', 'postgres', true), set_config('request.jwt.claims', '', true);

-- El equipo.
select set_config('role', 'authenticated', true),
       set_config('request.jwt.claims', '{"sub":"54444444-4444-4444-8444-444444444444","role":"authenticated"}', true);
select is((select count(*)::int from public.projects where name = 'Torre en borrador'), 1, 'el equipo ve los borradores');
update public.projects set status = 'published' where name = 'Torre en borrador';
select is((select count(*)::int from public.projects where name = 'Torre en borrador' and status = 'published'), 1,
  'y los publica');
select set_config('role', 'postgres', true), set_config('request.jwt.claims', '', true);

-- Si el plan se baja al gratis, sus proyectos dejan de destacarse.
update public.profiles set max_publications = 1 where id = '51111111-1111-4111-8111-111111111111';
set local role anon;
select is(
  (select count(*)::int from public.featured_projects(24) where owner_id = '51111111-1111-4111-8111-111111111111'),
  0, 'al bajar al plan gratis, la cuenta deja de destacarse');

select * from finish();
rollback;
