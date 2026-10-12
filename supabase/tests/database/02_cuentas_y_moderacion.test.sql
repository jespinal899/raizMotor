-- Permisos de las cuentas, de la moderación, de los reportes y de lo que solo usa el servidor: que nadie se dé
-- a sí mismo el papel del equipo, que solo el equipo modere, y que lo privado no salga por la API pública.
-- Se ejecuta con `supabase test db`; todo se deshace al final.
begin;

select plan(26);

insert into auth.users (id, email, raw_user_meta_data)
values
  ('11111111-1111-4111-8111-111111111111', 'ana@prueba.hn', '{"first_name":"Ana","last_name":"Mejía","phone":"+50499998888"}'),
  ('22222222-2222-4222-8222-222222222222', 'beto@prueba.hn', '{"first_name":"Beto","last_name":"Paz","phone":"+50433337777"}'),
  ('99999999-9999-4999-8999-999999999999', 'equipo@prueba.hn', '{"first_name":"Eva","last_name":"Equipo","phone":"+50422226666"}');

-- Nombrar una cuenta del equipo solo se hace como administrador de la base, como dice el README.
update public.profiles set role = 'admin' where id = '99999999-9999-4999-8999-999999999999';

create function pg_temp.as_user(account uuid) returns void language sql as $$
  select set_config('role', 'authenticated', true),
         set_config('request.jwt.claims', json_build_object('sub', account, 'role', 'authenticated')::text, true);
$$;
create function pg_temp.as_visitor(ip text) returns void language sql as $$
  select set_config('role', 'anon', true), set_config('request.jwt.claims', '{"role":"anon"}', true),
         set_config('request.headers', json_build_object('x-forwarded-for', ip)::text, true);
$$;
create function pg_temp.as_postgres() returns void language sql as $$
  select set_config('role', 'postgres', true), set_config('request.jwt.claims', '', true);
$$;
grant execute on all functions in schema pg_temp to anon, authenticated;

-- Un anuncio publicado de Ana, para reportarlo y moderarlo.
select pg_temp.as_user('11111111-1111-4111-8111-111111111111');
insert into public.properties (
  operation_key, title, description, type, operation, price, department, city, neighborhood, address,
  latitude, longitude, built_area, land_area, bedrooms, bathrooms, parking, photos
) values (
  'clave-ana', 'Casa amplia con patio en Palmira', 'Tres habitaciones, jardín y cochera para dos carros, cerca del bulevar.',
  'casa', 'venta', 185000, 'francisco-morazan', 'Tegucigalpa (Distrito Central)', 'Colonia Palmira', 'Avenida República de Chile',
  14.0889, -87.1921, 180, 300, 3, 2, 2, array['11111111-1111-4111-8111-111111111111/clave-ana/0.webp']
);
select pg_temp.as_postgres();
create temp table ids as select id as property from public.properties where operation_key = 'clave-ana';
grant select on ids to anon, authenticated;

-- Perfiles: cada cuenta lee el suyo y nadie se da el papel del equipo.
select pg_temp.as_user('11111111-1111-4111-8111-111111111111');
select is((select count(*)::int from public.profiles), 1, 'una cuenta solo lee su propio perfil');
update public.profiles set role = 'admin', max_publications = 100 where id = '11111111-1111-4111-8111-111111111111';
select pg_temp.as_postgres();
select is((select role || '/' || max_publications from public.profiles where id = '11111111-1111-4111-8111-111111111111'),
  'user/1', 'una cuenta no puede darse el papel del equipo ni más anuncios');

update auth.users set raw_user_meta_data = raw_user_meta_data || '{"role":"admin","max_publications":100}'
where id = '11111111-1111-4111-8111-111111111111';
select is((select role || '/' || max_publications from public.profiles where id = '11111111-1111-4111-8111-111111111111'),
  'user/1', 'los datos de la cuenta que manda el navegador no cambian el papel ni el límite');

select pg_temp.as_visitor('200.1.1.1');
select is((select count(*)::int from public.profiles), 0, 'un visitante no lee perfiles');

-- Moderación: solo el equipo.
select pg_temp.as_user('22222222-2222-4222-8222-222222222222');
select throws_ok($$ select public.admin_set_property_status((select property from ids), 'hidden', 'prueba') $$,
  '42501', null, 'una cuenta común no puede ocultar anuncios');
select throws_ok($$ select public.admin_set_publication_limit('22222222-2222-4222-8222-222222222222', 100, 'prueba') $$,
  '42501', null, 'una cuenta común no puede subirse el límite de anuncios');
select throws_ok($$ select * from public.admin_list_accounts('', 0, 10) $$,
  '42501', null, 'una cuenta común no puede listar las cuentas');
select is((select count(*)::int from public.moderation_log), 0, 'una cuenta común no lee el registro de moderación');

select pg_temp.as_visitor('200.1.1.1');
select throws_ok($$ select public.admin_set_property_status((select property from ids), 'hidden', 'prueba') $$,
  '42501', null, 'un visitante no puede moderar');

select pg_temp.as_user('99999999-9999-4999-8999-999999999999');
select lives_ok($$ select public.admin_set_property_status((select property from ids), 'hidden', 'Datos falsos') $$,
  'el equipo oculta un anuncio');
select is((select count(*)::int from public.moderation_log where action = 'hide_property'), 1,
  'la decisión queda en el registro de moderación');
select lives_ok($$ select public.admin_set_publication_limit('22222222-2222-4222-8222-222222222222', 25, 'Agente Pro') $$,
  'el equipo sube el límite de anuncios de una cuenta');
select ok((select count(*) from public.admin_list_accounts('', 0, 10)) >= 3, 'el equipo lista las cuentas');

select pg_temp.as_user('11111111-1111-4111-8111-111111111111');
update public.properties set status = 'published' where operation_key = 'clave-ana';
select pg_temp.as_postgres();
select is((select status from public.properties where operation_key = 'clave-ana'), 'hidden',
  'quien publicó no puede volver a publicar lo que ocultó el equipo');
select is((select max_publications from public.profiles where id = '22222222-2222-4222-8222-222222222222'), 25,
  'el límite que puso el equipo queda guardado');

select pg_temp.as_user('99999999-9999-4999-8999-999999999999');
select lives_ok($$ select public.admin_set_property_status((select property from ids), 'published', 'Revisado') $$,
  'el equipo devuelve el anuncio al catálogo');

-- Reportes: sin sesión, uno por hora desde la misma IP; los lee solo el equipo.
select pg_temp.as_visitor('200.1.1.1');
select lives_ok($$ select public.report_property((select property from ids), 'fraud', '', 'reporte-1') $$,
  'un visitante reporta un anuncio');
select throws_ok($$ select public.report_property((select property from ids), 'misleading', '', 'reporte-2') $$,
  'RZ004', null, 'el mismo visitante no puede reportar otra vez en la misma hora');
select pg_temp.as_visitor('200.2.2.2');
select lives_ok($$ select public.report_property((select property from ids), 'misleading', '', 'reporte-3') $$,
  'otro visitante, desde otra IP, sí puede reportar');
select throws_ok('select * from public.property_reports', '42501', null, 'un visitante no lee los reportes');

select pg_temp.as_user('22222222-2222-4222-8222-222222222222');
select is((select count(*)::int from public.property_reports), 0, 'una cuenta común no lee los reportes');
select pg_temp.as_user('99999999-9999-4999-8999-999999999999');
select is((select count(*)::int from public.property_reports), 2, 'el equipo lee los reportes');

-- Lo que solo usa el servidor (las funciones de Supabase, con la clave de servicio) no sale por la API.
select ok(not has_function_privilege('anon', 'public.claim_publisher_contact(uuid, text, text)', 'execute')
  and not has_function_privilege('authenticated', 'public.claim_publisher_contact(uuid, text, text)', 'execute'),
  'el correo del publicador solo lo pide la función de contacto');
select ok(not has_function_privilege('anon', 'public.orphan_photos(interval, integer)', 'execute')
  and not has_function_privilege('authenticated', 'public.orphan_photos(interval, integer)', 'execute')
  and not has_function_privilege('authenticated', 'public.count_orphan_photos(interval)', 'execute'),
  'la lista de fotos huérfanas solo la pide la función de limpieza');
select ok(not has_function_privilege('anon', 'public.take_rate_limit(text, text, integer, interval)', 'execute')
  and not has_function_privilege('authenticated', 'public.take_rate_limit(text, text, integer, interval)', 'execute'),
  'nadie gasta ni reinicia los límites de otro desde el navegador');
select ok(not has_table_privilege('anon', 'public.publisher_contacts', 'select')
  and not has_table_privilege('authenticated', 'public.publisher_contacts', 'select')
  and not has_table_privilege('anon', 'public.rate_limit_hits', 'select')
  and not has_table_privilege('authenticated', 'public.rate_limit_hits', 'select'),
  'los registros de contactos y de límites no se leen desde el navegador');

select * from finish();
rollback;
