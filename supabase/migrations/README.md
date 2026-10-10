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

## Tareas que se hacen a mano en el panel

- **Ocultar un anuncio:** en Table Editor > `properties`, cambia su `status` a `hidden`. Deja de verse en el catálogo, y quien lo publicó lo sigue viendo en «Mis publicaciones», entre las despublicadas, sin poder volver a publicarlo. Para devolverlo al catálogo, ponle `published`. El estado `unpublished` es el de los que despublica su propio dueño, que sí puede volver a publicarlos.
- **Dar más anuncios a una cuenta que contrató un plan:** en Table Editor > `profiles`, sube su `max_publications`: 25 para Agente Pro y 100 para Agente Élite. Es cuántos puede tener publicados a la vez, y de ese número saca «Mis publicaciones» el nombre del plan; con otra cantidad lo llama «Plan a medida».
