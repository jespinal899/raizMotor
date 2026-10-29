# Migraciones de la base de datos

Cada archivo de esta carpeta es un cambio en la base de datos de Supabase: tablas, permisos, funciones y depósitos de archivos. Juntos, y en orden, reconstruyen la base desde cero.

| Orden | Archivo | Qué crea | Necesita antes |
| --- | --- | --- | --- |
| 1 | `20261009000000_perfiles.sql` | El perfil de cada cuenta (`profiles`): nombre, teléfono y cuántos anuncios admite. Se crea solo al registrarse. | Nada |
| 2 | `20261009000100_anuncios.sql` | Los anuncios (`properties`), quién puede leerlos, publicarlos y eliminarlos, y lo que el servidor fija al guardarlos: de quién son, el límite del plan y los datos del anunciante. | La 1 |
| 3 | `20261009000200_fotos_de_anuncios.sql` | El depósito de fotos `property-photos` y sus permisos. | Nada |
| 4 | `20261009000300_cambios_de_cuenta.sql` | Lo que pasa cuando una cuenta corrige su nombre o su teléfono: su perfil los copia y sus anuncios pasan a mostrarlos. | La 1 y la 2 |
| 5 | `20261009000400_editar_anuncios.sql` | Que cada cuenta pueda editar sus anuncios, y lo que el servidor conserva al guardar un cambio: de quién es, su estado y los datos del anunciante. | La 1 y la 2 |
| 6 | `20261009000500_despublicar_anuncios.sql` | Que cada cuenta pueda despublicar sus anuncios y volver a publicarlos (estado `unpublished`), y que el límite del plan cuente solo los publicados. | La 1, la 2 y la 5 |
| 7 | `20261010000000_integridad_de_anuncios.sql` | Que el servidor exija a cada anuncio lo mismo que el formulario (largos, topes, municipio de la lista `municipalities`, punto dentro de Honduras y fotos de la carpeta de su cuenta), que el límite del plan no se pueda rebasar con publicaciones simultáneas, y que el perfil descarte un teléfono que no sea de Honduras. | La 1, la 2, la 4, la 5 y la 6 |
| 8 | `20261011000000_busqueda_en_el_servidor.sql` | Las columnas que la base calcula para buscar (`search_place`, la zona sin mayúsculas ni tildes, y `area`) y los índices de la búsqueda. El sitio busca, ordena y pagina el catálogo en la base. | La 2 |
| 9 | `20261011000100_moderacion.sql` | El papel de cada cuenta (`user` o `admin`), los reportes de anuncios (`property_reports`), el registro de moderación (`moderation_log`) y las funciones con que el equipo revisa reportes, oculta anuncios y cambia límites. | La 1, la 2 y la 7 |
| 10 | `20261012000000_limites_de_uso.sql` | Los límites de uso (`rate_limit_hits`): correcciones de anuncios (30 por hora), cambios de estado (20 por hora), fotos con el plan Propietario (50 cada 2 horas; sin límite con un plan de pago) y reportes sin sesión (1 por hora por IP, guardando solo su huella). El equipo no tiene límite. | La 3 y la 9 |
| 11 | `20261013000000_contacto_al_publicador.sql` | El registro técnico de «Contacta al publicador» (`publisher_contacts`): qué envío se hizo y sobre qué anuncio, sin los datos de quien escribe. Y las funciones que usa la Edge Function `contact-publisher` para reservar el envío, con sus límites (5 por hora por IP y 20 por hora por anuncio), y liberarlo si el correo no salió. | La 2 y la 10 |
| 12 | `20261014000000_limpieza_de_fotos.sql` | Las funciones que usa la Edge Function `cleanup-photos` para saber qué fotos del depósito no usa ningún anuncio desde hace más de 24 horas, y un índice sobre `properties.photos`. No borra nada por sí misma. | La 1 y la 2 |
| 13 | `20261015000000_destacadas_de_pago.sql` | La función `featured_properties` que lee la portada: los anuncios publicados de cuentas con un plan de pago (`max_publications > 1`), como mucho 2 por cuenta y en un orden que rota cada hora. No entrega nada de los perfiles. | La 1 y la 2 |
| 14 | `20261016000000_proyectos.sql` | Los proyectos (`projects`) y sus modelos de unidad (`project_models`): cualquiera ve los publicados y solo el equipo los gestiona. La función `featured_projects` para la portada (misma regla que los anuncios destacados) y el depósito público `project-photos`, donde solo el equipo sube fotos. | La 1, la 8 y la 9 |
| 15 | `20261017000000_proyectos_de_inmobiliarias.sql` | El límite de proyectos de cada cuenta (`profiles.max_projects`), que las inmobiliarias gestionen sus propios proyectos y modelos (con su límite, sus fotos en su carpeta y lo oculto por el equipo sin tocar), `admin_set_account_limits` para activar un plan en un paso, y los destacados contando como de pago también a las inmobiliarias. | La 14 y la 13 |
| 16 | `20261018000000_moderar_proyectos.sql` | Reportar proyectos (`report_project`, en la misma tabla `property_reports`, que ahora es de un anuncio o de un proyecto), revisar esos reportes con `admin_review_report`, y `admin_set_project_status` para que el equipo oculte un proyecto o lo devuelva al catálogo. El registro de moderación anota el proyecto. | La 9 y la 15 |
| 17 | `20261019000000_limpieza_de_fotos_de_proyectos.sql` | Las funciones con que `cleanup-photos` sabe qué fotos del depósito `project-photos` no usa ningún proyecto desde hace más de 24 horas, y un índice sobre `projects.photos`. No borra nada por sí misma. | La 12 y la 14 |
| 18 | `20261020000000_cotizar_proyectos.sql` | Cotizar un proyecto: `claim_project_contact` reserva el envío que hace `contact-publisher` a la cuenta de la inmobiliaria, con los mismos límites que el contacto por un anuncio, y `publisher_contacts` pasa a ser de un anuncio o de un proyecto. No guarda los datos de quien escribe. | La 11 y la 14 |
| 19 | `20261025000000_proyectos_del_equipo_desde_el_sitio.sql` | Que una cuenta del equipo publique un proyecto desde el sitio: si no dice de quién es, queda a su nombre, y sale publicado. Antes llegaba sin dueño y la base lo rechazaba. Lo que el equipo carga desde el panel conserva el dueño y el estado que escriba. | La 15 |
| 20 | `20261029000000_inmobiliarias.sql` | El perfil público de cada inmobiliaria (`agencies`): nombre comercial, tipo (inmobiliaria o constructora), logo, contacto, redes y la dirección de su página (`/inmobiliaria/<slug>`). Solo lo crea una cuenta con plan de inmobiliaria (`max_projects > 0`, si no responde `RZ006`), cada una edita el suyo, y el público lo ve mientras el plan siga activo. El depósito público `agency-logos` (512 KB por archivo, cada cuenta en su carpeta) y `admin_set_agency_verified`, con que el equipo marca una inmobiliaria como verificada; la marca se pierde sola si cambia de nombre. | La 15 y la 16 |

Cada archivo es una unidad que funciona completa: una tabla va siempre con sus permisos y con los disparadores que la protegen, nunca en archivos distintos. Una tabla sin ellos aceptaría lo que no debe.

## Cómo aplicar una migración

Hay dos maneras, y dejan lo mismo.

**Con la herramienta de Supabase**, si el proyecto ya está enlazado (`supabase link`): `supabase db push` aplica las que falten, en orden, y recuerda cuáles ya aplicó. No uses `supabase config push`: `supabase/config.toml` trae los valores de fábrica de la herramienta, no los de este proyecto, y los pondría en su lugar.

**A mano, en el panel:**

1. Abre el proyecto en [supabase.com](https://supabase.com/dashboard) y entra en **SQL Editor > New query**.
2. Pega el contenido completo del archivo y pulsa **Run**.
3. Debe responder «Success. No rows returned». Si da un error, no sigas con la siguiente: cópialo tal cual.

Se aplican una por una, en el orden de la tabla, que es el de su nombre: empieza por la fecha y la hora. Si se pega una antes que la que necesita, falla diciendo cuál falta y no deja nada a medias.

Las que ya se aplicaron no hay que repetirlas, pero repetir una no rompe ni duplica nada ni altera ningún dato: son idempotentes.

## Cómo añadir una

- Un archivo nuevo por cambio, con el nombre `AAAAMMDDHHMMSS_descripcion.sql` y la fecha real del día. Si necesita otra migración, lo dice en su cabecera y lo comprueba al empezar, como hace la de anuncios. Es el formato de la herramienta de Supabase, así que la carpeta sirve tal cual para `supabase db push` si algún día se usa.
- Nunca se edita una migración ya aplicada: lo que haya que corregir va en otra nueva.
- Debe poder ejecutarse dos veces sin fallar: `create table if not exists`, `create or replace function`, y `drop policy if exists` antes de cada `create policy`.
- Toda tabla nueva lleva `enable row level security` y sus permisos en la misma migración. Sin ellos, cualquiera con la clave pública del sitio podría leerla o escribirla.
- Los límites que comprueba `validate_property` son los de `src/features/properties/utils/publicationValidation.ts`, y los municipios de `municipalities`, los de `src/features/properties/data/departments.data.ts`. Si cambian en el sitio, cambian también aquí, con una migración nueva; una prueba avisa si los municipios dejan de coincidir.

## Tareas que se hacen a mano en el panel de Supabase

- **Nombrar una cuenta del equipo:** es lo único que no se hace desde el sitio, a propósito: nadie puede darse a sí mismo el papel de administración. La cuenta tiene que existir (registrarse en el sitio) y después, en el SQL Editor, con su correo:

  ```sql
  update public.profiles set role = 'admin'
  where id = (select id from auth.users where email = 'correo@del-equipo.hn');
  ```

  Para quitarle el papel, lo mismo con `role = 'user'`. Al volver a entrar al sitio, el menú de la cuenta ofrece el «Panel de administración».

## Tareas que se hacen desde el panel de administración del sitio (`/admin`)

- **Revisar los reportes:** ocultar el anuncio reportado, darlo por resuelto o descartarlo.
- **Ocultar un anuncio, o devolverlo al catálogo:** deja de verse en el catálogo, y quien lo publicó lo sigue viendo en «Mis publicaciones», entre las despublicadas, sin poder volver a publicarlo. El estado `unpublished` es el de los que despublica su propio dueño, que sí puede volver a publicarlos; el equipo no los vuelve a publicar.
- **Dar más anuncios a una cuenta que contrató un plan:** en la pestaña Cuentas, «Cambiar límite»: 25 para Agente Pro y 100 para Agente Élite. Es cuántos puede tener publicados a la vez, y de ese número saca «Mis publicaciones» el nombre del plan; con otra cantidad lo llama «Plan a medida».

- **Verificar una inmobiliaria:** en la pestaña Inmobiliarias, «Verificar», después de revisar que la empresa existe y que la cuenta es suya (RTN, sitio web o una llamada). Sale la marca «Verificada» en su página, sus anuncios y sus proyectos. Si la inmobiliaria cambia de nombre, la marca se quita sola y hay que volver a revisarla.

Cada decisión queda en la tabla `moderation_log`, con quién la tomó, cuándo y la nota que se escribió.
