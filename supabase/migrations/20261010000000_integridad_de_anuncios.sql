-- Integridad de los anuncios: el servidor exige lo mismo que el formulario, el límite del plan no se puede
-- rebasar enviando varias publicaciones a la vez, y el perfil solo copia de la cuenta un nombre y un
-- teléfono con forma válida.
--
-- Necesita antes: 20261009000000_perfiles.sql, 20261009000100_anuncios.sql, 20261009000300_cambios_de_cuenta.sql,
-- 20261009000400_editar_anuncios.sql y 20261009000500_despublicar_anuncios.sql.
-- Se aplica en el panel de Supabase: SQL Editor > New query > pegar todo > Run.
--
-- Es idempotente: ejecutarla otra vez deja exactamente lo mismo. No cambia ningún anuncio ni ningún perfil
-- ya guardado: las comprobaciones nuevas se aplican a lo que se publique o se cambie desde ahora, y en un
-- cambio solo a los datos que cambian. Así, un anuncio antiguo que no las cumpla se puede seguir
-- despublicando, eliminando o corrigiendo en lo demás.

do $$
begin
  if to_regclass('public.profiles') is null then
    raise exception 'Falta aplicar antes la migración 20261009000000_perfiles.sql';
  end if;
  if to_regclass('public.properties') is null then
    raise exception 'Falta aplicar antes la migración 20261009000100_anuncios.sql';
  end if;
  if to_regprocedure('public.handle_user_updated()') is null then
    raise exception 'Falta aplicar antes la migración 20261009000300_cambios_de_cuenta.sql';
  end if;
  if to_regprocedure('public.keep_property_consistent()') is null then
    raise exception 'Falta aplicar antes la migración 20261009000400_editar_anuncios.sql';
  end if;
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.properties'::regclass
      and conname = 'properties_status_check'
      and pg_get_constraintdef(oid) like '%unpublished%'
  ) then
    raise exception 'Falta aplicar antes la migración 20261009000500_despublicar_anuncios.sql';
  end if;
end;
$$;

-- Los municipios de Honduras por departamento: los mismos que ofrece el formulario, y una prueba comprueba
-- que coinciden con src/features/properties/data/departments.data.ts. Solo los lee la comprobación de los
-- anuncios, así que la API no los expone.
create table if not exists public.municipalities (
  department text not null,
  name text not null,
  primary key (department, name)
);

alter table public.municipalities enable row level security;

revoke all on public.municipalities from anon, authenticated;

insert into public.municipalities (department, name) values
  ('atlantida', 'Arizona'),
  ('atlantida', 'El Porvenir'),
  ('atlantida', 'Esparta'),
  ('atlantida', 'Jutiapa'),
  ('atlantida', 'La Ceiba'),
  ('atlantida', 'La Masica'),
  ('atlantida', 'San Francisco'),
  ('atlantida', 'Tela'),
  ('choluteca', 'Apacilagua'),
  ('choluteca', 'Choluteca'),
  ('choluteca', 'Concepción de María'),
  ('choluteca', 'Duyure'),
  ('choluteca', 'El Corpus'),
  ('choluteca', 'El Triunfo'),
  ('choluteca', 'Marcovia'),
  ('choluteca', 'Morolica'),
  ('choluteca', 'Namasigüe'),
  ('choluteca', 'Orocuina'),
  ('choluteca', 'Pespire'),
  ('choluteca', 'San Antonio de Flores'),
  ('choluteca', 'San Isidro'),
  ('choluteca', 'San José'),
  ('choluteca', 'San Marcos de Colón'),
  ('choluteca', 'Santa Ana de Yusguare'),
  ('colon', 'Balfate'),
  ('colon', 'Bonito Oriental'),
  ('colon', 'Iriona'),
  ('colon', 'Limón'),
  ('colon', 'Sabá'),
  ('colon', 'Santa Fe'),
  ('colon', 'Santa Rosa de Aguán'),
  ('colon', 'Sonaguera'),
  ('colon', 'Tocoa'),
  ('colon', 'Trujillo'),
  ('comayagua', 'Ajuterique'),
  ('comayagua', 'Comayagua'),
  ('comayagua', 'El Rosario'),
  ('comayagua', 'Esquías'),
  ('comayagua', 'Humuya'),
  ('comayagua', 'La Libertad'),
  ('comayagua', 'La Trinidad'),
  ('comayagua', 'Lamaní'),
  ('comayagua', 'Las Lajas'),
  ('comayagua', 'Lejamaní'),
  ('comayagua', 'Meámbar'),
  ('comayagua', 'Minas de Oro'),
  ('comayagua', 'Ojos de Agua'),
  ('comayagua', 'San Jerónimo'),
  ('comayagua', 'San José de Comayagua'),
  ('comayagua', 'San José del Potrero'),
  ('comayagua', 'San Luis'),
  ('comayagua', 'San Sebastián'),
  ('comayagua', 'Siguatepeque'),
  ('comayagua', 'Taulabé'),
  ('comayagua', 'Villa de San Antonio'),
  ('copan', 'Cabañas'),
  ('copan', 'Concepción'),
  ('copan', 'Copán Ruinas'),
  ('copan', 'Corquín'),
  ('copan', 'Cucuyagua'),
  ('copan', 'Dolores'),
  ('copan', 'Dulce Nombre'),
  ('copan', 'El Paraíso'),
  ('copan', 'Florida'),
  ('copan', 'La Jigua'),
  ('copan', 'La Unión'),
  ('copan', 'Nueva Arcadia'),
  ('copan', 'San Agustín'),
  ('copan', 'San Antonio'),
  ('copan', 'San Jerónimo'),
  ('copan', 'San José'),
  ('copan', 'San Juan de Opoa'),
  ('copan', 'San Nicolás'),
  ('copan', 'San Pedro'),
  ('copan', 'Santa Rita'),
  ('copan', 'Santa Rosa de Copán'),
  ('copan', 'Trinidad de Copán'),
  ('copan', 'Veracruz'),
  ('cortes', 'Choloma'),
  ('cortes', 'La Lima'),
  ('cortes', 'Omoa'),
  ('cortes', 'Pimienta'),
  ('cortes', 'Potrerillos'),
  ('cortes', 'Puerto Cortés'),
  ('cortes', 'San Antonio de Cortés'),
  ('cortes', 'San Francisco de Yojoa'),
  ('cortes', 'San Manuel'),
  ('cortes', 'San Pedro Sula'),
  ('cortes', 'Santa Cruz de Yojoa'),
  ('cortes', 'Villanueva'),
  ('el-paraiso', 'Alauca'),
  ('el-paraiso', 'Danlí'),
  ('el-paraiso', 'El Paraíso'),
  ('el-paraiso', 'Güinope'),
  ('el-paraiso', 'Jacaleapa'),
  ('el-paraiso', 'Liure'),
  ('el-paraiso', 'Morocelí'),
  ('el-paraiso', 'Oropolí'),
  ('el-paraiso', 'Potrerillos'),
  ('el-paraiso', 'San Antonio de Flores'),
  ('el-paraiso', 'San Lucas'),
  ('el-paraiso', 'San Matías'),
  ('el-paraiso', 'Soledad'),
  ('el-paraiso', 'Teupasenti'),
  ('el-paraiso', 'Texiguat'),
  ('el-paraiso', 'Trojes'),
  ('el-paraiso', 'Vado Ancho'),
  ('el-paraiso', 'Yauyupe'),
  ('el-paraiso', 'Yuscarán'),
  ('francisco-morazan', 'Alubarén'),
  ('francisco-morazan', 'Cedros'),
  ('francisco-morazan', 'Curarén'),
  ('francisco-morazan', 'El Porvenir'),
  ('francisco-morazan', 'Guaimaca'),
  ('francisco-morazan', 'La Libertad'),
  ('francisco-morazan', 'La Venta'),
  ('francisco-morazan', 'Lepaterique'),
  ('francisco-morazan', 'Maraita'),
  ('francisco-morazan', 'Marale'),
  ('francisco-morazan', 'Nueva Armenia'),
  ('francisco-morazan', 'Ojojona'),
  ('francisco-morazan', 'Orica'),
  ('francisco-morazan', 'Reitoca'),
  ('francisco-morazan', 'Sabanagrande'),
  ('francisco-morazan', 'San Antonio de Oriente'),
  ('francisco-morazan', 'San Buenaventura'),
  ('francisco-morazan', 'San Ignacio'),
  ('francisco-morazan', 'San Juan de Flores (Cantarranas)'),
  ('francisco-morazan', 'San Miguelito'),
  ('francisco-morazan', 'Santa Ana'),
  ('francisco-morazan', 'Santa Lucía'),
  ('francisco-morazan', 'Talanga'),
  ('francisco-morazan', 'Tatumbla'),
  ('francisco-morazan', 'Tegucigalpa (Distrito Central)'),
  ('francisco-morazan', 'Valle de Ángeles'),
  ('francisco-morazan', 'Vallecillo'),
  ('francisco-morazan', 'Villa de San Francisco'),
  ('gracias-a-dios', 'Ahuas'),
  ('gracias-a-dios', 'Brus Laguna'),
  ('gracias-a-dios', 'Juan Francisco Bulnes'),
  ('gracias-a-dios', 'Puerto Lempira'),
  ('gracias-a-dios', 'Ramón Villeda Morales'),
  ('gracias-a-dios', 'Wampusirpi'),
  ('intibuca', 'Camasca'),
  ('intibuca', 'Colomoncagua'),
  ('intibuca', 'Concepción'),
  ('intibuca', 'Dolores'),
  ('intibuca', 'Intibucá'),
  ('intibuca', 'Jesús de Otoro'),
  ('intibuca', 'La Esperanza'),
  ('intibuca', 'Magdalena'),
  ('intibuca', 'Masaguara'),
  ('intibuca', 'San Antonio'),
  ('intibuca', 'San Francisco de Opalaca'),
  ('intibuca', 'San Isidro'),
  ('intibuca', 'San Juan'),
  ('intibuca', 'San Marcos de la Sierra'),
  ('intibuca', 'San Miguel Guancapla'),
  ('intibuca', 'Santa Lucía'),
  ('intibuca', 'Yamaranguila'),
  ('islas-de-la-bahia', 'Guanaja'),
  ('islas-de-la-bahia', 'José Santos Guardiola'),
  ('islas-de-la-bahia', 'Roatán'),
  ('islas-de-la-bahia', 'Utila'),
  ('la-paz', 'Aguanqueterique'),
  ('la-paz', 'Cabañas'),
  ('la-paz', 'Cane'),
  ('la-paz', 'Chinacla'),
  ('la-paz', 'Guajiquiro'),
  ('la-paz', 'La Paz'),
  ('la-paz', 'Lauterique'),
  ('la-paz', 'Marcala'),
  ('la-paz', 'Mercedes de Oriente'),
  ('la-paz', 'Opatoro'),
  ('la-paz', 'San Antonio del Norte'),
  ('la-paz', 'San José'),
  ('la-paz', 'San Juan'),
  ('la-paz', 'San Pedro de Tutule'),
  ('la-paz', 'Santa Ana'),
  ('la-paz', 'Santa Elena'),
  ('la-paz', 'Santa María'),
  ('la-paz', 'Santiago de Puringla'),
  ('la-paz', 'Yarula'),
  ('lempira', 'Belén'),
  ('lempira', 'Candelaria'),
  ('lempira', 'Cololaca'),
  ('lempira', 'Erandique'),
  ('lempira', 'Gracias'),
  ('lempira', 'Gualcince'),
  ('lempira', 'Guarita'),
  ('lempira', 'La Campa'),
  ('lempira', 'La Iguala'),
  ('lempira', 'La Unión'),
  ('lempira', 'La Virtud'),
  ('lempira', 'Las Flores'),
  ('lempira', 'Lepaera'),
  ('lempira', 'Mapulaca'),
  ('lempira', 'Piraera'),
  ('lempira', 'San Andrés'),
  ('lempira', 'San Francisco'),
  ('lempira', 'San Juan Guarita'),
  ('lempira', 'San Manuel Colohete'),
  ('lempira', 'San Marcos de Caiquín'),
  ('lempira', 'San Rafael'),
  ('lempira', 'San Sebastián'),
  ('lempira', 'Santa Cruz'),
  ('lempira', 'Talgua'),
  ('lempira', 'Tambla'),
  ('lempira', 'Tomalá'),
  ('lempira', 'Valladolid'),
  ('lempira', 'Virginia'),
  ('ocotepeque', 'Belén Gualcho'),
  ('ocotepeque', 'Concepción'),
  ('ocotepeque', 'Dolores Merendón'),
  ('ocotepeque', 'Fraternidad'),
  ('ocotepeque', 'La Encarnación'),
  ('ocotepeque', 'La Labor'),
  ('ocotepeque', 'Lucerna'),
  ('ocotepeque', 'Mercedes'),
  ('ocotepeque', 'Ocotepeque'),
  ('ocotepeque', 'San Fernando'),
  ('ocotepeque', 'San Francisco del Valle'),
  ('ocotepeque', 'San Jorge'),
  ('ocotepeque', 'San Marcos'),
  ('ocotepeque', 'Santa Fe'),
  ('ocotepeque', 'Sensenti'),
  ('ocotepeque', 'Sinuapa'),
  ('olancho', 'Campamento'),
  ('olancho', 'Catacamas'),
  ('olancho', 'Concordia'),
  ('olancho', 'Dulce Nombre de Culmí'),
  ('olancho', 'El Rosario'),
  ('olancho', 'Esquipulas del Norte'),
  ('olancho', 'Gualaco'),
  ('olancho', 'Guarizama'),
  ('olancho', 'Guata'),
  ('olancho', 'Guayape'),
  ('olancho', 'Jano'),
  ('olancho', 'Juticalpa'),
  ('olancho', 'La Unión'),
  ('olancho', 'Mangulile'),
  ('olancho', 'Manto'),
  ('olancho', 'Patuca'),
  ('olancho', 'Salamá'),
  ('olancho', 'San Esteban'),
  ('olancho', 'San Francisco de Becerra'),
  ('olancho', 'San Francisco de la Paz'),
  ('olancho', 'Santa María del Real'),
  ('olancho', 'Silca'),
  ('olancho', 'Yocón'),
  ('santa-barbara', 'Arada'),
  ('santa-barbara', 'Atima'),
  ('santa-barbara', 'Azacualpa'),
  ('santa-barbara', 'Ceguaca'),
  ('santa-barbara', 'Chinda'),
  ('santa-barbara', 'Concepción del Norte'),
  ('santa-barbara', 'Concepción del Sur'),
  ('santa-barbara', 'El Níspero'),
  ('santa-barbara', 'Gualala'),
  ('santa-barbara', 'Ilama'),
  ('santa-barbara', 'Las Vegas'),
  ('santa-barbara', 'Macuelizo'),
  ('santa-barbara', 'Naranjito'),
  ('santa-barbara', 'Nueva Frontera'),
  ('santa-barbara', 'Nuevo Celilac'),
  ('santa-barbara', 'Petoa'),
  ('santa-barbara', 'Protección'),
  ('santa-barbara', 'Quimistán'),
  ('santa-barbara', 'San Francisco de Ojuera'),
  ('santa-barbara', 'San José de Colinas'),
  ('santa-barbara', 'San Luis'),
  ('santa-barbara', 'San Marcos'),
  ('santa-barbara', 'San Nicolás'),
  ('santa-barbara', 'San Pedro Zacapa'),
  ('santa-barbara', 'San Vicente Centenario'),
  ('santa-barbara', 'Santa Bárbara'),
  ('santa-barbara', 'Santa Rita'),
  ('santa-barbara', 'Trinidad'),
  ('valle', 'Alianza'),
  ('valle', 'Amapala'),
  ('valle', 'Aramecina'),
  ('valle', 'Caridad'),
  ('valle', 'Goascorán'),
  ('valle', 'Langue'),
  ('valle', 'Nacaome'),
  ('valle', 'San Francisco de Coray'),
  ('valle', 'San Lorenzo'),
  ('yoro', 'Arenal'),
  ('yoro', 'El Negrito'),
  ('yoro', 'El Progreso'),
  ('yoro', 'Jocón'),
  ('yoro', 'Morazán'),
  ('yoro', 'Olanchito'),
  ('yoro', 'Santa Rita'),
  ('yoro', 'Sulaco'),
  ('yoro', 'Victoria'),
  ('yoro', 'Yorito'),
  ('yoro', 'Yoro')
on conflict do nothing;

-- Antes de guardar un anuncio, nuevo o cambiado: lo que exige el formulario
-- (src/features/properties/utils/publicationValidation.ts) lo exige también el servidor, para que nadie lo
-- salte llamando a la API con la clave pública. Corre después de los otros disparadores, que van por orden
-- alfabético, así que comprueba el anuncio tal como va a quedar. El sitio reconoce el código RZ002.
create or replace function public.validate_property()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  is_new boolean := tg_op = 'INSERT';
  photo text;
begin
  -- El sitio usa claves de 32 caracteres hexadecimales: se admite algo de margen, nunca una ruta.
  if is_new and new.operation_key !~ '^[A-Za-z0-9_-]{1,64}$' then
    raise exception 'invalid_property: operation_key' using errcode = 'RZ002';
  end if;

  if (is_new or new.title is distinct from old.title)
    and char_length(btrim(new.title)) not between 10 and 80 then
    raise exception 'invalid_property: title' using errcode = 'RZ002';
  end if;

  if (is_new or new.description is distinct from old.description)
    and char_length(btrim(new.description)) not between 30 and 2000 then
    raise exception 'invalid_property: description' using errcode = 'RZ002';
  end if;

  if (is_new or new.price is distinct from old.price) and new.price > 100000000 then
    raise exception 'invalid_property: price' using errcode = 'RZ002';
  end if;

  if (is_new or new.department is distinct from old.department or new.city is distinct from old.city)
    and not exists (
      select 1 from public.municipalities where department = new.department and name = new.city
    ) then
    raise exception 'invalid_property: city' using errcode = 'RZ002';
  end if;

  if (is_new or new.neighborhood is distinct from old.neighborhood)
    and char_length(btrim(new.neighborhood)) not between 1 and 120 then
    raise exception 'invalid_property: neighborhood' using errcode = 'RZ002';
  end if;

  if (is_new or new.address is distinct from old.address)
    and char_length(btrim(new.address)) not between 5 and 200 then
    raise exception 'invalid_property: address' using errcode = 'RZ002';
  end if;

  -- Un rectángulo que contiene todo Honduras, islas incluidas.
  if (is_new or new.latitude is distinct from old.latitude or new.longitude is distinct from old.longitude)
    and (new.latitude not between 12.9 and 17.5 or new.longitude not between -89.4 and -83.0) then
    raise exception 'invalid_property: coordinates' using errcode = 'RZ002';
  end if;

  if (is_new or new.built_area is distinct from old.built_area or new.land_area is distinct from old.land_area)
    and (new.built_area > 100000000 or new.land_area > 100000000) then
    raise exception 'invalid_property: area' using errcode = 'RZ002';
  end if;

  if (
    is_new
    or new.bedrooms is distinct from old.bedrooms
    or new.bathrooms is distinct from old.bathrooms
    or new.parking is distinct from old.parking
  ) and (new.bedrooms > 100 or new.bathrooms > 100 or new.parking > 100) then
    raise exception 'invalid_property: rooms' using errcode = 'RZ002';
  end if;

  if (is_new or new.features is distinct from old.features)
    and (
      cardinality(new.features) > 20
      or exists (select 1 from unnest(new.features) as feature where char_length(feature) not between 1 and 60)
    ) then
    raise exception 'invalid_property: features' using errcode = 'RZ002';
  end if;

  -- Cada foto es un archivo de la carpeta de quien publica, con la forma de ruta que crea el sitio: así un
  -- anuncio no puede mostrar las fotos de otra cuenta.
  if is_new or new.photos is distinct from old.photos then
    foreach photo in array new.photos loop
      if photo !~ '^[0-9a-f-]{36}/[A-Za-z0-9_-]{1,64}/[0-9]\.(jpg|png|webp)$'
        or split_part(photo, '/', 1) <> new.owner_id::text then
        raise exception 'invalid_property: photos' using errcode = 'RZ002';
      end if;
    end loop;
  end if;

  return new;
end;
$$;

create or replace trigger validate_property_before_write
  before insert or update on public.properties
  for each row execute function public.validate_property();

-- Antes de guardar un anuncio nuevo. Es la función de 20261009000500_despublicar_anuncios.sql con un cambio:
-- las publicaciones de una misma cuenta se comprueban de una en una. Sin ese turno, dos enviadas a la vez
-- contarían los mismos anuncios y las dos cabrían en el último lugar del plan.
create or replace function public.prepare_property()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  owner public.profiles;
begin
  -- Nadie publica en nombre de otra cuenta ni elige el estado de su anuncio.
  new.owner_id := auth.uid();
  new.status := 'published';

  -- El turno dura hasta el final de la transacción: para entonces este anuncio ya cuenta para la siguiente.
  perform pg_advisory_xact_lock(hashtextextended('properties:' || new.owner_id::text, 0));

  select * into owner from public.profiles where id = new.owner_id;

  -- Reintentar un anuncio ya guardado no cuenta como otro: no gasta el límite, y la restricción de unicidad
  -- hace que la repetición no guarde nada.
  if not exists (
    select 1 from public.properties
    where owner_id = new.owner_id and operation_key = new.operation_key
  ) and (
    select count(*) from public.properties where owner_id = new.owner_id and status = 'published'
  ) >= coalesce(owner.max_publications, 1) then
    -- El sitio reconoce este código y explica que el plan no admite más anuncios.
    raise exception 'publication_limit_reached' using errcode = 'RZ001';
  end if;

  new.advertiser_name := trim(coalesce(owner.first_name, '') || ' ' || coalesce(owner.last_name, ''));
  new.advertiser_phone := coalesce(owner.phone, '');

  return new;
end;
$$;

-- Antes de guardar un cambio. Es la función de 20261009000500_despublicar_anuncios.sql con el mismo cambio:
-- volver a publicar también espera su turno, igual que publicar un anuncio nuevo.
create or replace function public.keep_property_consistent()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  owner public.profiles;
begin
  -- De quién es el anuncio, con qué clave se publicó y cuándo no cambian nunca.
  new.id := old.id;
  new.owner_id := old.owner_id;
  new.operation_key := old.operation_key;
  new.created_at := old.created_at;

  select * into owner from public.profiles where id = new.owner_id;

  -- Con su sesión del sitio, quien publicó el anuncio solo lo pasa de publicado a despublicado y al revés.
  -- Lo que el equipo ocultó sigue oculto, y nadie oculta por su cuenta: eso se hace desde el panel.
  if (select auth.uid()) is not null then
    if old.status = 'hidden' or new.status not in ('published', 'unpublished') then
      new.status := old.status;
    end if;

    -- Volver a publicar ocupa un lugar del plan, igual que publicar un anuncio nuevo.
    if new.status = 'published' and old.status <> 'published' then
      perform pg_advisory_xact_lock(hashtextextended('properties:' || new.owner_id::text, 0));

      if (
        select count(*) from public.properties where owner_id = new.owner_id and status = 'published'
      ) >= coalesce(owner.max_publications, 1) then
        raise exception 'publication_limit_reached' using errcode = 'RZ001';
      end if;
    end if;
  end if;

  -- El anunciante nunca lo escribe el sitio: sale siempre del perfil de la cuenta.
  new.advertiser_name := trim(coalesce(owner.first_name, '') || ' ' || coalesce(owner.last_name, ''));
  new.advertiser_phone := coalesce(owner.phone, '');

  new.updated_at := now();

  return new;
end;
$$;

-- Los datos de una cuenta los escribe ella misma, y se pueden escribir sin pasar por el formulario. Antes de
-- copiarlos al perfil, que se muestra en sus anuncios, se recorta el nombre al largo que admite el formulario
-- y se descarta un teléfono que no tenga la forma de uno de Honduras: +504 y ocho dígitos, empezando por 2,
-- 3, 7, 8 o 9. Que el número sea de esa persona solo lo confirmaría un código enviado a él.
create or replace function public.clean_name(value text)
returns text
language sql
immutable
set search_path = ''
as $$
  select left(btrim(coalesce(value, '')), 80)
$$;

create or replace function public.clean_phone(value text)
returns text
language sql
immutable
set search_path = ''
as $$
  select case when value ~ '^\+504[23789][0-9]{7}$' then value else '' end
$$;

-- Ayudantes de los disparadores: no se llaman desde la API.
revoke execute on function public.clean_name(text), public.clean_phone(text) from public, anon, authenticated;

-- Al crearse una cuenta. Es la función de 20261009000000_perfiles.sql, con los datos ya limpios.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, first_name, last_name, phone)
  values (
    new.id,
    public.clean_name(new.raw_user_meta_data ->> 'first_name'),
    public.clean_name(new.raw_user_meta_data ->> 'last_name'),
    public.clean_phone(new.raw_user_meta_data ->> 'phone')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- Al cambiar los datos de una cuenta. Es la función de 20261009000300_cambios_de_cuenta.sql, con los datos
-- ya limpios.
create or replace function public.handle_user_updated()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles
  set
    first_name = public.clean_name(new.raw_user_meta_data ->> 'first_name'),
    last_name = public.clean_name(new.raw_user_meta_data ->> 'last_name'),
    phone = public.clean_phone(new.raw_user_meta_data ->> 'phone')
  where id = new.id;

  return new;
end;
$$;
