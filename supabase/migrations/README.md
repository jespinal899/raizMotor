# Migraciones de la base de datos

Cada archivo de esta carpeta es un cambio en la base de datos de Supabase: tablas, permisos, funciones y depósitos de archivos. Juntos, y en orden, reconstruyen la base desde cero.

| Orden | Archivo | Qué crea | Necesita antes |
| --- | --- | --- | --- |
| 1 | `20261009000000_perfiles.sql` | El perfil de cada cuenta (`profiles`): nombre, teléfono y cuántos anuncios admite. Se crea solo al registrarse. | Nada |
| 2 | `20261009000100_anuncios.sql` | Los anuncios (`properties`), quién puede leerlos, publicarlos y eliminarlos, y lo que el servidor fija al guardarlos: de quién son, el límite del plan y los datos del anunciante. | La 1 |
| 3 | `20261009000200_fotos_de_anuncios.sql` | El depósito de fotos `property-photos` y sus permisos. | Nada |

Cada archivo es una unidad que funciona completa: una tabla va siempre con sus permisos y con los disparadores que la protegen, nunca en archivos distintos. Una tabla sin ellos aceptaría lo que no debe.

## Cómo aplicar una migración

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

## Tareas que se hacen a mano en el panel

- **Ocultar un anuncio:** en Table Editor > `properties`, cambia su `status` a `hidden`. Deja de verse en el catálogo, y quien lo publicó lo sigue viendo en «Mis anuncios».
- **Dar más anuncios a una cuenta que contrató un plan:** en Table Editor > `profiles`, sube su `max_publications`.
