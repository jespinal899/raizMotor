# DomusRaíz

[![CI/CD](https://github.com/jespinal899/raizMotor/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/jespinal899/raizMotor/actions/workflows/ci-cd.yml)

Plataforma web inmobiliaria para Honduras: reúne casas, apartamentos y terrenos en un solo lugar para publicarlos, encontrarlos y contactar a quien los anuncia, sin comisiones ocultas.

**Sitio publicado:** https://raiz-motor.vercel.app/

## Estado actual

Las cuentas y los anuncios funcionan con [Supabase](https://supabase.com/). Un anuncio publicado lo ve cualquier visitante, a nombre de la cuenta que lo publicó. Las propiedades de ejemplo, inventadas y marcadas como «Ejemplo», no se mezclan con los anuncios reales salvo que la compilación lo pida con `VITE_SHOW_SAMPLE_LISTINGS=true`. Las demás funciones que necesitan un servicio externo muestran un aviso en lugar de simular el resultado.

Sin las variables de Supabase en la compilación, el sitio sigue funcionando sin cuentas, con las propiedades de ejemplo, y cada anuncio se guarda solo en el navegador de quien lo publica, que lo ve avisado. El pipeline no publica una compilación así (ver [Integración y despliegue continuos](#integración-y-despliegue-continuos)).

| Función | Estado |
| --- | --- |
| Portada: carrusel, propiedades destacadas, Quiénes somos y Cómo funciona | Funciona. Las destacadas son anuncios publicados de cuentas con un plan de pago (más de 1 anuncio a la vez): como mucho 2 por cuenta, en un orden que rota cada hora, con la marca «Destacada». Las propiedades de ejemplo nunca se destacan con Supabase; sin destacadas, la sección no se muestra |
| Búsqueda por tipo, operación, zona, precio, dormitorios y baños, con orden y paginación | Funciona sobre los anuncios publicados y, si se muestran, los de ejemplo, que van detrás de los reales. Con Supabase, la base de datos filtra, ordena y pagina: solo viaja la página pedida. Si Supabase no responde, lo dice en lugar de mostrar un catálogo vacío |
| Proyectos en preventa, en construcción o de entrega inmediata (`/proyectos`) | Catálogo con filtros por zona, tipo, etapa y precio, ficha con modelos, amenidades, mapa y contacto con la desarrolladora por WhatsApp, y sección «Proyectos en preventa» en la portada, con la misma regla de destacados que las propiedades. Los publican las inmobiliarias con su plan desde «Mis publicaciones» > Proyectos, y el equipo también puede cargarlos (ver [Proyectos](#proyectos)); los de ejemplo salen donde salen las propiedades de ejemplo |
| Precios en dólares y en lempiras | Funciona; los lempiras se calculan con un tipo de cambio de referencia fijo |
| Ficha de una propiedad | Muestra los anuncios publicados y los de ejemplo; se comparte por WhatsApp o enlace y, si el anuncio tiene su punto en el mapa, abre la ruta en Google Maps |
| Contactar a quien publica | La ficha de un anuncio publicado dice quién lo publica y abre WhatsApp con el teléfono de su cuenta y el anuncio ya citado. Los de ejemplo llevan al contacto del sitio |
| Contactar al publicador desde la ficha («Contacta al publicador en segundos») | Quien ve un anuncio, sin necesidad de cuenta, deja su nombre, su correo y su teléfono, y le llegan por correo a quien lo publicó, que puede responderle directamente. Lo envía la Edge Function `contact-publisher` con Resend: el correo del publicador nunca llega al navegador, y los datos de quien escribe no se guardan. Tiene verificación contra bots y un límite de 5 envíos por hora por IP y 20 por anuncio. No aparece en las propiedades de ejemplo |
| Cotizar un proyecto desde su ficha («Cotiza este proyecto») | Igual que el contacto por un anuncio, con el modelo de unidad que interesa (opcional): le llega por correo a la cuenta de la inmobiliaria, con el proyecto, el modelo y los datos de quien escribe, y puede responderle directamente. La misma función `contact-publisher`, la misma verificación contra bots y los mismos límites: 5 envíos por hora por IP (sumando anuncios y proyectos) y 20 por proyecto. Los datos de quien escribe no se guardan. No aparece en los proyectos de ejemplo |
| Reportar una publicación desde su ficha | Funciona con Supabase, con o sin sesión: el reporte llega al panel de administración. Hay un tope de reportes por hora, por cuenta y por anuncio. Las propiedades de ejemplo no se reportan |
| Vistas de una ficha | No se muestran: el contador solo sumaría las de cada navegador. Vuelve cuando haya un servidor que sume las de todos |
| Publicar una propiedad: formulario por pasos con mapa, estacionamientos y comodidades | Se llega desde los planes y pide iniciar sesión. Guarda el anuncio en Supabase con hasta 10 fotos, que se reducen antes de subirlas, y queda visible de inmediato. Cada cuenta admite los anuncios de su plan: uno con el gratuito |
| Mis publicaciones | Cada cuenta ve las suyas en dos pestañas, «Publicadas» y «Despublicadas», y puede corregirlas, despublicarlas, volver a publicarlas o eliminarlas. Un banner dice su plan y, en una barra, cuántas tiene publicadas de las que admite (0/1, 3/25…). Solo las publicadas ocupan el plan: despublicar una deja libre su lugar |
| Editar un anuncio | El mismo formulario de publicar, abierto con sus datos: se cambia lo que haga falta, también las fotos. Solo lo edita quien lo publicó, y no puede cambiar su estado ni su anunciante |
| Mi cuenta | Cada cuenta corrige su nombre y su teléfono; sus anuncios pasan a mostrarlos. El correo y la contraseña no se cambian desde ahí |
| Contacto | Abre WhatsApp con la consulta ya escrita (la propiedad o el plan por el que se llega, si hay uno). El formulario por correo (`ContactForm`) está hecho, pero no se muestra hasta tener el servicio de correo |
| Registro, inicio y cierre de sesión | Funcionan con Supabase cuando la compilación tiene sus dos variables (ver [Cuentas](#cuentas)); sin ellas, los formularios avisan de que aún no están disponibles. Quien se registra debe confirmar su correo antes de entrar; la barra muestra de quién es la sesión |
| Acceso con Google | No se muestra: falta dar de alta el sitio en Google. El botón (`GoogleButton`) vuelve a las pantallas de entrar y registrarse cuando lo esté |
| Recuperar contraseña | Funciona con Supabase: se pide un enlace por correo y, al abrirlo, se elige otra contraseña. Un enlace caducado o ya usado lleva a una página que lo explica y ofrece pedir otro |
| Términos y condiciones, y política de privacidad | Texto preliminar; pendiente de revisión legal |
| Planes: Propietario, Agente inmobiliario e Inmobiliarias | El botón «Publicar» lleva aquí. Propietario abre el formulario (1 publicación gratis), Agente inmobiliario abre sus planes mensuales e Inmobiliarias abre el contacto |
| Planes para agentes inmobiliarios (Agente Pro y Agente Élite): precio mensual en lempiras y motivos para contratar | Se muestran; el botón de cada plan abre su página de contratación. Solo prometen lo que el sitio ya hace: anuncios activos, destacados en la portada y contacto directo |
| Página de error | Si una página falla al abrirse, el sitio lo explica en español, con la barra y el pie, en lugar de la pantalla del enrutador. Si falló porque se publicó una versión nueva mientras la pestaña estaba abierta, recarga la página una vez y llega a la nueva |
| Contratar un plan de agente en tres pasos (datos de suscripción, resumen y medio de pago), con el resumen de compra y su ISV siempre a un lado | Abre WhatsApp con la solicitud ya escrita; el pago se coordina a mano, porque aún no hay pagos en línea ni cuentas. La pantalla de pago con tarjeta es una demostración de diseño que no cobra nada y solo existe al desarrollar (`npm run dev`), no en el sitio publicado |
| Código de descuento al contratar un plan | No se muestra: aún no existen códigos. La casilla (`CouponBox`) vuelve al resumen de compra cuando haya códigos que validar |
| Panel de administración (`/admin`) | Solo para las cuentas del equipo, que se nombran a mano (ver [`supabase/migrations`](supabase/migrations/README.md)). Revisa los reportes, oculta anuncios o los devuelve al catálogo, y cambia cuántos anuncios admite cada cuenta. Cada decisión queda registrada con quién la tomó |
| Límites de uso | La base de datos limita cuántas veces se corrige un anuncio (30 por hora), se despublica o se vuelve a publicar (20 por hora), se suben fotos con el plan Propietario (50 cada 2 horas; sin límite con un plan de pago) y se reporta sin sesión (1 por hora por IP). El sitio explica el límite en lugar de presentarlo como un fallo. El inicio de sesión, el registro y la recuperación los limita Supabase, y pueden llevar la verificación contra bots (ver [Seguridad de las cuentas](#seguridad-de-las-cuentas)) |

## Tecnologías

- **Interfaz:** React 19, TypeScript 6 y React Router 7.
- **Estilos:** Tailwind CSS 4 y componentes de shadcn/ui (estilo `base-nova`, sobre Base UI).
- **Cuentas:** Supabase, con registro confirmado por correo.
- **Mapa:** Leaflet, con teselas y buscador de direcciones de OpenStreetMap.
- **Herramientas:** Vite 8 para desarrollar y compilar, y Oxlint como linter.
- **Pruebas:** Vitest 5 con Testing Library.

## Puesta en marcha

Necesitas Node.js 24, la versión indicada en `.nvmrc`.

```bash
git clone https://github.com/jespinal899/raizMotor.git
cd raizMotor
npm ci
npm run dev
```

La aplicación queda en http://localhost:5173. `npm ci` instala exactamente las versiones de `package-lock.json` y no lo modifica; usa `npm install` solo para añadir o actualizar una dependencia.

### Cuentas

Las cuentas las lleva un proyecto de Supabase. La compilación lo conoce por dos variables; sin ellas el sitio funciona igual, pero sin cuentas.

| Variable | Valor |
| --- | --- |
| `VITE_SUPABASE_URL` | La dirección del proyecto: `https://….supabase.co`. |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Su clave «publishable» (o la antigua «anon»). Es pública por diseño. |
| `VITE_SHOW_SAMPLE_LISTINGS` | Opcional. `true` muestra las propiedades de ejemplo junto a los anuncios reales; sin ella, solo se muestran cuando no hay Supabase. |

- **En tu equipo:** copia `.env.example` como `.env.local`, que Git ignora, y rellénalo.
- **En el sitio publicado:** añádelas en Vercel (Settings > Environment Variables, entorno Production). El pipeline las recoge al compilar.
- **Nunca** pongas la clave «secret» ni la «service_role» en una variable `VITE_`: todo lo que empieza así viaja dentro del sitio, y con esa clave cualquiera se salta los permisos.

En el panel de Supabase, en Authentication > URL Configuration, «Site URL» debe ser la dirección del sitio publicado, y `http://localhost:5173/**` debe figurar entre las «Redirect URLs»: ahí vuelve quien abre un enlace de su correo, sea el de confirmar la cuenta o el de elegir otra contraseña. Los dos devuelven a la portada, y la aplicación lleva desde ahí a la página que corresponde.

#### Correo

El correo que trae Supabase solo escribe a los miembros de su organización, y muy pocas veces por hora: sirve para probar. Para abrir el registro al público hay que conectarle un servicio propio, en Authentication > Emails > SMTP Settings. Con [Resend](https://resend.com/), que exige un dominio verificado:

| Campo | Valor |
| --- | --- |
| Host | `smtp.resend.com` |
| Port | `465` |
| Username | `resend` |
| Password | La clave de API de Resend. Va solo en el panel de Supabase: no es una variable del sitio ni se guarda en el repositorio. |
| Sender email | Una dirección del dominio verificado, por ejemplo `no-reply@…` |

Conviene crear en Resend una clave solo para esto (API Keys, con permiso «Sending access»), distinta de la del contacto al publicador: así se puede revocar una sin tocar la otra. Después:

- En Authentication > Rate Limits, subir «Rate limit for sending emails», que con el correo de Supabase es de 2 por hora y solo se puede cambiar con un servicio propio. El tope real pasa a ser el del plan de Resend.
- En Authentication > URL Configuration, poner en «Site URL» la dirección del sitio y en «Redirect URLs» sus dominios (por ejemplo `https://www.tudominio.hn/**`): si no, Supabase rechaza los enlaces de los correos.

Confirmar la cuenta y recuperar la contraseña funcionan con un **código de 6 dígitos** que llega al correo y se escribe en el sitio, en lugar de un enlace: algunos correos abren los enlaces solos para revisarlos y los gastan antes de que la persona los use. Supabase genera los códigos, los vence y limita los intentos. Para que funcione en el proyecto publicado, en Authentication > Providers > Email (o Sign In / Providers):

- «Confirm email» activado: la cuenta no entra hasta escribir el código.
- «Email OTP Expiration» en `900` segundos (15 minutos) y «Email OTP Length» en `6`. El vencimiento vale para todos los códigos y enlaces de las cuentas.
- Las plantillas «Confirm signup» y «Reset password» con el código (`{{ .Token }}`), las de `supabase/templates/` que se indican abajo.

Para recuperar la contraseña, primero se escribe solo el código: el sitio lo comprueba con Supabase y, únicamente si es correcto, pide la contraseña nueva (dos veces). Quien intenta entrar sin haber confirmado su cuenta puede escribir el código ahí mismo o pedir otro, y se puede pedir otro código cada minuto. La página `/restablecer-contrasena` sigue atendiendo los enlaces de recuperación que se enviaron antes de los códigos.

Los textos en español de los cuatro correos (el código para activar la cuenta, el código para elegir otra contraseña, confirmar el correo nuevo y el enlace para entrar) están en `supabase/templates/`. Cada archivo dice en qué plantilla del panel (Authentication > Emails > Templates) se pega y con qué asunto; se copia el archivo entero, comentario incluido. `supabase/config.toml` los usa también en el Supabase local, donde llegan al buzón de prueba (Mailpit, `http://127.0.0.1:54324`).

### Proyectos

Las inmobiliarias publican sus proyectos solas, desde «Mis publicaciones» > Proyectos, con un formulario por pasos: ubicación en el mapa, datos del proyecto, modelos de unidad y amenidades con hasta 20 fotos y un video. Se publican directo, como los anuncios: el equipo revisó la cuenta al activarle el plan, y si algo está mal se reporta y se oculta. Cualquiera reporta un proyecto desde su ficha («Reportar»), con los mismos motivos y límites que los anuncios; el reporte llega a la pestaña Reportes del panel, marcado como «Proyecto», donde el equipo lo oculta, lo resuelve o lo descarta. La pestaña Proyectos del panel lista todos (también los borradores) para ocultarlos o devolverlos al catálogo; un borrador solo lo publica su inmobiliaria. Pueden corregirlos, despublicarlos (quedan en borrador) y eliminarlos.

Para que una cuenta publique proyectos, el equipo le activa un plan de inmobiliaria en el panel de administración > Cuentas > «Cambiar límite». Cada plan pone sus dos límites:

| Plan | Proyectos publicados a la vez | Propiedades publicadas a la vez | Precio |
| --- | --- | --- | --- |
| Inmobiliaria Inicial | 1 | 50 | L 1,999/mes + ISV |
| Inmobiliaria Plus | 3 | 150 | L 3,999/mes + ISV |
| Inmobiliaria Corporativa | 10 | 500 | L 6,999/mes + ISV |

Los planes se definen en `src/features/shop/data/plans.data.ts` (la página `/planes/inmobiliarias` y los botones del panel salen de ahí); la base de datos hace cumplir el límite de proyectos (`profiles.max_projects`). Una cuenta con un plan de agente o de inmobiliaria cuenta como de pago para los destacados de la portada.

El equipo también puede cargar un proyecto a nombre de una cuenta desde el panel de Supabase:

1. Storage > `project-photos`: sube los renders y las fotos de la obra (JPG, PNG o WebP de hasta 5 MB), en una carpeta con el nombre del proyecto.
2. Table Editor > `projects` > Insert row:
   - `owner_id`: el identificador de la cuenta de la inmobiliaria (Authentication > Users). Si la cuenta tiene un plan de pago (más de 1 anuncio a la vez), el proyecto se destaca en la portada.
   - `status`: `draft` mientras se prepara; `published` para mostrarlo; `hidden` para retirarlo sin borrarlo.
   - `kind`: `residencial`, `torre`, `condominio` o `lotificacion`. `stage`: `preventa`, `construccion` o `entrega_inmediata`.
   - `price_from` en dólares; `delivery_date` (opcional) con el primer día del mes de entrega, p. ej. `2027-12-01`.
   - `department`: el identificador del departamento, como en los anuncios (`francisco-morazan`, `cortes`…), y `latitude`/`longitude` del punto en el mapa.
   - `photos`: las rutas dentro del depósito (`torre-vista/portada.webp`), la portada primero. Una dirección https completa también vale, pero el sitio solo carga imágenes de Supabase y de Unsplash.
   - `developer_phone` (opcional), completo: `+50499999999`. Con él, la ficha ofrece escribir a la desarrolladora por WhatsApp; sin él, lleva a la página de contacto.
3. Table Editor > `project_models`: una fila por modelo de unidad, con el `project_id` del proyecto, su nombre, habitaciones, baños, área en m² y precio desde.

La base de datos revisa cada campo al guardarlo, y solo las cuentas del equipo pueden crear o cambiar proyectos.

#### Seguridad de las cuentas

Estos ajustes viven en el panel de Supabase, no en el repositorio: `supabase/config.toml` trae los valores de fábrica de la herramienta, no los del proyecto. Antes de abrir el registro al público, revisa en Authentication:

| Dónde | Qué |
| --- | --- |
| Sign In / Providers > Email | «Confirm email» activado: quien se registra confirma su correo antes de entrar. |
| Sign In / Providers > Email | «Minimum password length» en 8, lo mismo que pide el formulario. |
| Attack Protection | «Prevent use of leaked passwords» activado, si el plan del proyecto lo incluye. |
| Rate Limits | Inicios de sesión y registros por IP cada 5 minutos: unos 10; verificaciones de códigos: unos 10; correos por hora: según el servicio de correo. Son el primer freno contra quien prueba contraseñas. |
| API Settings (en Project Settings > Data API) | «Max Rows» en 100: el sitio pide como mucho 20 filas por página, y así nadie descarga el catálogo de mil en mil. |
| Emails > SMTP Settings | El servicio de correo propio descrito en [Correo](#correo). |
| URL Configuration | «Site URL» con la dirección del sitio publicado, y solo las «Redirect URLs» que se usan. |

##### Verificación contra bots (Cloudflare Turnstile)

Iniciar sesión, registrarse y pedir el enlace de recuperación pueden llevar una verificación contra bots, que Supabase comprueba en su servidor: es lo que frena a quien prueba contraseñas desde muchas IP a la vez. El sitio la muestra solo si la compilación trae `VITE_TURNSTILE_SITE_KEY`. Para activarla, **en este orden**:

1. En [Cloudflare](https://dash.cloudflare.com/) > Turnstile, crea un widget para el dominio del sitio, en modo **Managed**. Da dos claves: la «Site Key», pública, y la «Secret Key».
2. En Vercel, añade `VITE_TURNSTILE_SITE_KEY` con la «Site Key» (Production) y publica el sitio. Comprueba que la casilla aparece en las tres pantallas.
3. Solo entonces, en Supabase > Authentication > Attack Protection, activa «Enable Captcha protection» con el proveedor Turnstile y la «Secret Key». La secreta nunca va en el repositorio ni en una variable `VITE_`.

La verificación no se ve: Cloudflare comprueba en segundo plano a quien visita y solo muestra una casilla encima del botón cuando sospecha que es un bot (el sitio pinta el widget con `appearance: interaction-only`). Al enviar, si la comprobación aún no terminó, el formulario la espera unos segundos. En modo **Invisible** nunca habría casilla, ni siquiera para un bot sospechoso; en **Non-interactive** se vería siempre un recuadro: por eso Managed.

Si se activa en Supabase antes de publicar el sitio con la casilla, nadie podrá entrar ni registrarse. Para desactivarla, al revés: primero en Supabase y después se retira la variable.

#### Base de datos

Las tablas, sus permisos y el depósito de fotos se crean con los archivos de [`supabase/migrations`](supabase/migrations/README.md), que se aplican con `supabase db push` o se pegan en el SQL Editor del panel de Supabase. Son idempotentes: repetirlos no cambia nada. Allí se explica también cómo nombrar las cuentas del equipo, que son las que entran al panel de administración. Las migraciones se aplican **antes** de publicar el sitio que las usa: si no, lo que dependa de ellas falla.

#### Contacto al publicador (Edge Function)

El formulario de la ficha llama a la función `supabase/functions/contact-publisher`, que busca el correo de quien publicó el anuncio (o de la cuenta dueña del proyecto, al cotizar uno) y le envía los datos con [Resend](https://resend.com/). Necesita la migración 11 (y la 18 para los proyectos) y estos secretos de Supabase, que se ponen desde tu equipo y nunca van al repositorio:

```bash
supabase secrets set RESEND_API_KEY=re_…                       # la clave de API de Resend
supabase secrets set CONTACT_FROM_EMAIL="DomusRaíz <no-reply@tudominio.hn>"   # un remitente de tu dominio verificado en Resend
supabase secrets set SITE_URL=https://tudominio.hn              # para enlazar el anuncio en el correo
supabase secrets set ALLOWED_ORIGINS=https://tudominio.hn,https://raiz-motor.vercel.app   # desde dónde se puede llamar
supabase secrets set TURNSTILE_SECRET_KEY=…                     # la misma «Secret Key» de Turnstile; sin ella no se exige la verificación
```

`ALLOWED_ORIGINS` lleva cada dirección exacta desde la que se abre el sitio, sin barra al final: con `www` y sin ella son dos orígenes distintos, y también lo es cada dominio de Vercel. Una llamada desde un origen que no está en la lista se rechaza sin enviar nada, y el registro de la función (Edge Functions → contact-publisher → Logs) dice qué origen fue.

`SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` los pone Supabase solo en cada función: no hay que añadirlos. Después se publica la función, sin exigir sesión, porque quien escribe no necesita cuenta:

```bash
supabase functions deploy contact-publisher --no-verify-jwt
```

Se vuelve a publicar cada vez que cambia algo en `supabase/functions/contact-publisher`. El pipeline no la publica: igual que las migraciones, se hace desde tu equipo. Su lógica está en `contact.ts`, sin nada propio de Deno, y la prueban las pruebas del proyecto (`contact.test.ts`).

#### Limpieza de fotos huérfanas (Edge Function)

Al publicar, primero se suben las fotos y después se guarda el anuncio. Si el anuncio no llega a guardarse (el límite del plan, una conexión cortada, una página cerrada a medias), si falla el borrado de las fotos viejas al editar o borrar un anuncio, o si se elimina una cuenta, quedan en el depósito fotos que no usa ningún anuncio. La función `supabase/functions/cleanup-photos` las borra una vez al día, y lo mismo con las de los proyectos (depósito `project-photos`): solo las que no están en ningún anuncio o proyecto, esté publicado, despublicado u oculto, y que se subieron hace más de 24 horas, para no tocar lo de quien está publicando en ese momento. Borra como mucho 10.000 por ejecución; si quedan más, salen al día siguiente.

Necesita la migración 12 y un secreto propio, de al menos 32 caracteres, que solo conocen la función y la tarea programada. En PowerShell se genera uno con `[guid]::NewGuid().ToString('N') + [guid]::NewGuid().ToString('N')`:

```bash
supabase secrets set CLEANUP_SECRET=…
supabase functions deploy cleanup-photos --no-verify-jwt
```

La primera vez conviene ejecutarla en modo de prueba, que solo cuenta las fotos que borraría, sin tocar nada (en PowerShell, `curl.exe`):

```bash
curl.exe -X POST "https://<proyecto>.supabase.co/functions/v1/cleanup-photos?dry_run=1" -H "x-cleanup-secret: <secreto>"
```

Responde `{"dryRun":true,"orphans":N}`. Si la cifra tiene sentido, se programa en el SQL Editor. Hacen falta las extensiones `pg_cron` y `pg_net` (Database > Extensions, o Integrations > Cron), y el secreto se guarda en el Vault, no en el repositorio. Se ejecuta a las 9:00 UTC, que son las 3:00 en Honduras:

```sql
select vault.create_secret('<el mismo valor de CLEANUP_SECRET>', 'cleanup_photos_secret');

select cron.schedule(
  'limpiar-fotos-huerfanas',
  '0 9 * * *',
  $$
  select net.http_post(
    url := 'https://<proyecto>.supabase.co/functions/v1/cleanup-photos',
    headers := jsonb_build_object(
      'x-cleanup-secret',
      (select decrypted_secret from vault.decrypted_secrets where name = 'cleanup_photos_secret')
    ),
    timeout_milliseconds := 60000
  );
  $$
);
```

Cada ejecución deja en los registros de la función (Edge Functions > cleanup-photos > Logs) cuántas fotos borró, nunca cuáles. Para dejar de ejecutarla: `select cron.unschedule('limpiar-fotos-huerfanas');`. Se vuelve a publicar cada vez que cambia algo en `supabase/functions/cleanup-photos`; su lógica está en `cleanup.ts` y la prueban las pruebas del proyecto (`cleanup.test.ts`).

#### Mapas (Mapbox)

Los mapas de la ficha y del formulario de publicar usan los cuadros de [Mapbox](https://www.mapbox.com/) si la compilación tiene su clave pública, y los de OpenStreetMap si no la tiene. Los de OpenStreetMap son gratuitos pero pensados para poco tráfico: para el sitio publicado conviene Mapbox, cuyo plan gratuito admite uso comercial.

1. En Mapbox, Account > Tokens > Create a token: una clave **pública** (empieza por `pk.`), con solo los permisos públicos que trae marcados, y en «URL restrictions» las direcciones del sitio (por ejemplo `https://www.tudominio.hn`, `https://tudominio.hn` y `https://raiz-motor.vercel.app`). Así nadie puede usarla desde otro sitio.
2. En Vercel, Settings > Environment Variables, en Production: `VITE_MAPBOX_TOKEN` con esa clave. Se aplica en la siguiente publicación.

Nunca va aquí una clave secreta (`sk.`): todo lo que empieza por `VITE_` viaja dentro del sitio. El sitio no la usa y el pipeline no publica si la encuentra. Con los cuadros de Mapbox el mapa muestra su logo y su atribución, que sus condiciones exigen. El buscador de direcciones sigue siendo el de OpenStreetMap (Nominatim): solo se usa al publicar, una búsqueda por segundo como mucho, y guardar el punto que elige quien publica está permitido con él.

#### Pruebas

Hay tres tipos de pruebas, y ninguna habla con el proyecto real:

- **Unitarias** (`npm test`, Vitest): el código del sitio y la lógica de las funciones. No necesitan nada más, aunque exista `.env.local`: la configuración de Vitest (`vite.config.ts`) deja vacías las dos variables, y lo que necesita cuentas usa un servicio simulado.
- **De la base de datos** (`supabase/tests/database`, pgTAP): aplican todas las migraciones a un Supabase local y comprueban sus permisos: que nadie vea, corrija ni borre anuncios ajenos, que nadie se dé el papel del equipo, que solo el equipo modere, el límite de reportes sin sesión, qué fotos cuenta como huérfanas la limpieza y que lo privado no salga por la API pública.
- **De punta a punta** (`e2e/`, Playwright): recorren el sitio compilado en un navegador de verdad contra ese Supabase local: registrarse, publicar un anuncio con su foto, encontrarlo como visitante, y que otra cuenta no pueda editarlo. El buscador de direcciones y los cuadros del mapa se simulan.

El CI ejecuta las tres en cada pull request; las dos últimas, en el trabajo «Base de datos y punta a punta», y no publica si falla alguna. Para ejecutarlas en tu equipo hace falta Docker (Docker Desktop en Windows) y la herramienta de Supabase:

```bash
supabase start            # levanta Supabase en tu equipo con todas las migraciones
npm run test:db           # pruebas de la base de datos
supabase status -o env    # muestra API_URL y PUBLISHABLE_KEY del Supabase local
# compila el sitio contra el Supabase local, con esos dos valores
VITE_SUPABASE_URL=http://127.0.0.1:54321 VITE_SUPABASE_PUBLISHABLE_KEY=<PUBLISHABLE_KEY> npx vite build
npx playwright install chromium   # la primera vez
npm run test:e2e          # pruebas de punta a punta
supabase stop             # apaga el Supabase local
```

En PowerShell, la compilación se escribe así: `$env:VITE_SUPABASE_URL="http://127.0.0.1:54321"; $env:VITE_SUPABASE_PUBLISHABLE_KEY="<PUBLISHABLE_KEY>"; npx vite build`. No uses `npm run build` para esto, ni `.env.local` con el proyecto real: las pruebas crean cuentas y anuncios.

## Comandos

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Arranca el servidor de desarrollo. |
| `npm test` | Ejecuta las pruebas unitarias una vez. |
| `npm run test:watch` | Ejecuta las pruebas y las repite al guardar. |
| `npm run test:db` | Ejecuta las pruebas de la base de datos contra el Supabase local (ver [Pruebas](#pruebas)). |
| `npm run test:e2e` | Ejecuta las pruebas de punta a punta contra el sitio compilado (ver [Pruebas](#pruebas)). |
| `npm run lint` | Revisa el código con Oxlint. |
| `npm run build` | Comprueba los tipos y compila el sitio en `dist/`. |
| `npm run preview` | Sirve el sitio compilado para revisarlo. |

## Arquitectura

La aplicación es una SPA sin servidor propio, organizada por funcionalidades. El modelo C4 completo, con sus diagramas, está en **[docs/arquitectura.md](docs/arquitectura.md)**:

- **Contexto:** quién usa DomusRaíz y de qué servicios externos depende.
- **Contenedores:** el sitio estático en Vercel y la aplicación que se ejecuta en el navegador.
- **Componentes:** las funcionalidades de `src/features` y cómo se relacionan.
- **Código:** las capas que sigue cada funcionalidad.
- **Idempotencia:** qué pasa cuando una acción se repite.
- **Despliegue:** el recorrido de un cambio hasta el sitio publicado.

## Estructura del proyecto

```text
src/
├── features/            Una carpeta por funcionalidad
│   ├── home/            Portada
│   ├── search/          Búsqueda del catálogo
│   ├── properties/      Catálogo, ficha de propiedad y publicación
│   ├── contact/         Formulario de contacto
│   ├── auth/            Iniciar sesión, registro y recuperación
│   ├── shop/            Planes
│   ├── legal/           Términos y condiciones, y política de privacidad
│   └── admin/           Panel de administración del equipo
├── components/          Componentes compartidos por varias funcionalidades
│   ├── layout/          Cabecera, menú y pie
│   └── ui/              Componentes de shadcn/ui
├── hooks/               Hooks compartidos
├── shared/              Constantes, tipos y utilidades comunes
├── lib/                 Ayudantes de bibliotecas, como `cn` para las clases
├── pages/               Páginas que no pertenecen a una funcionalidad
├── router/              Rutas de la aplicación
└── test/                Ayudantes y datos para las pruebas
```

Cada funcionalidad usa, según lo que necesite, las mismas carpetas: `pages`, `components`, `hooks`, `services`, `types`, `utils` y `data`. `src/config` y `src/lib/httpClient.ts` están reservados para cuando exista la API y hoy están vacíos.

## Convenciones

- **Código por funcionalidad.** Lo nuevo va en su carpeta de `src/features`. Solo pasa a `src/components`, `src/hooks` o `src/shared` cuando lo usan varias funcionalidades.
- **Capas.** El componente pinta, el hook decide y el servicio habla con el exterior. La lógica pura vive en `utils`.
- **Servicios intercambiables.** Cada servicio declara un contrato y elige su implementación en un solo sitio. Las publicaciones se guardan localmente; las funciones que aún requieren un servicio externo muestran un aviso si este falta.
- **Idempotencia.** Repetir una acción no la duplica: un envío en curso o ya hecho no se repite, y toda escritura lleva una clave de operación. Las reglas están en [docs/arquitectura.md](docs/arquitectura.md#idempotencia).
- **Pruebas primero.** Cada comportamiento se escribe con su prueba, junto al código (`Componente.test.tsx`), con los bloques `// Arrange`, `// Act` y `// Assert` a la vista.
- **Componentes.** Función flecha con `export default`. Los de interfaz base se añaden con `npx shadcn@latest add <nombre>`.
- **Idioma.** Identificadores en inglés; textos de la interfaz, comentarios y pruebas en español.
- **Commits.** [Conventional Commits](https://www.conventionalcommits.org/es/) en español, con un cambio lógico por commit: `feat(auth): agrega el registro con correo`.

## Integración y despliegue continuos

Cada push a `master` ejecuta el pipeline de `.github/workflows/ci-cd.yml`: linter, pruebas, compilación y publicación en Vercel, en https://raiz-motor.vercel.app/. Si un paso falla, el sitio publicado no cambia. En un pull request se ejecuta todo menos la publicación.

Vercel no despliega por su cuenta: `vercel.json` desactiva su despliegue automático, para que el pipeline sea el único camino al sitio publicado. Para publicar, el pipeline necesita tres secretos del repositorio (Settings > Secrets and variables > Actions):

| Secreto | De dónde sale, en vercel.com |
| --- | --- |
| `VERCEL_TOKEN` | Account Settings > Tokens, con alcance sobre el equipo del proyecto. |
| `VERCEL_ORG_ID` | Settings > General del equipo dueño del proyecto: el «Team ID», que empieza por `team_`. |
| `VERCEL_PROJECT_ID` | Settings > General del proyecto: el «Project ID», que empieza por `prj_`. |

Si falta alguno, el despliegue falla y lo dice. Si alguno no corresponde al proyecto, la herramienta de Vercel solo responde «Project not found»: el pipeline averigua cuál es (`.github/scripts/vercelDiagnosis.mjs`) y lo deja como aviso en la página de la ejecución, sin mostrar ningún identificador.

Antes de compilar, el pipeline comprueba también las variables de producción que trae de Vercel (`.github/scripts/checkProductionEnv.mjs`): no publica si falta alguna de las dos de Supabase, porque el sitio guardaría los anuncios solo en el navegador de quien publica, ni si la clave es una privilegiada («secret» o «service_role»), porque viajaría dentro del sitio. Cada problema sale como aviso, sin mostrar ningún valor.

Antes de subir un cambio, comprueba en tu equipo los mismos pasos:

```bash
npm run lint
npm test
npm run build
```

El archivo `vercel.json` también hace que cualquier dirección del sitio entregue la aplicación, para que funcionen los enlaces directos y recargar una página, y fija las cabeceras de seguridad de cada respuesta. La más delicada es la política de contenido (`Content-Security-Policy`): solo deja cargar scripts del propio sitio, y datos e imágenes de Supabase (`*.supabase.co`), de Mapbox y OpenStreetMap (cuadros del mapa y buscador de direcciones) de Unsplash (las fotos de la portada) y de Cloudflare Turnstile (la verificación contra bots). Si el sitio pasa a usar otro servicio, o Supabase con un dominio propio, hay que añadirlo ahí: si no, el navegador lo bloquea.

### Buscadores y vista previa al compartir

Google, WhatsApp y Facebook leen el HTML tal como llega, y el sitio se arma en el navegador: sin ayuda, todas las fichas dirían solo «DomusRaíz», sin foto. Cuatro funciones de Vercel, en `api/`, lo completan (la lógica está en `api/_lib/seo.ts` y la prueban las pruebas del proyecto):

- **`/propiedad/:id`** (`api/propiedad.ts`): entrega el sitio con la cabecera de ese anuncio: su título con el precio, una descripción con el tipo, la zona y el precio, la portada como imagen de la vista previa, la dirección canónica y los datos estructurados (schema.org `RealEstateListing`) que Google usa para entender el precio y la ubicación. Solo con anuncios publicados; si no existe responde 404, y si Supabase no responde abre la ficha igual, sin vista previa.
- **`/proyectos/:id`** (`api/proyecto.ts`): lo mismo con cada proyecto publicado: su nombre con el precio desde, una descripción con el tipo, la etapa y la zona, su primera foto y los datos estructurados con el precio desde, la desarrolladora y la entrega estimada.
- **`/sitemap.xml`** (`api/sitemap.ts`): las páginas públicas y cada proyecto y anuncio publicado, con su fecha de última edición.
- **`/robots.txt`** (`api/robots.ts`): cierra a los buscadores las páginas de cuenta, publicar, administrar y entrar, y señala el mapa del sitio.

Usan las mismas variables de Supabase de la compilación, con la clave pública. Conviene añadir en Vercel (Settings > Environment Variables, en Production) la variable `SITE_URL` con la dirección del sitio, por ejemplo `https://www.tudominio.hn`: así la dirección canónica y el mapa del sitio usan siempre esa, aunque se entre por el dominio de Vercel. Sin ella, usan la dirección con que se pidió la página.

Para comprobarlo después de publicar: pegar el enlace de una ficha en WhatsApp (debe salir la foto y el precio) o en el [depurador de Facebook](https://developers.facebook.com/tools/debug/), y dar de alta el sitio en [Google Search Console](https://search.google.com/search-console) con el mapa `https://<tu dominio>/sitemap.xml`.

## Pendiente

- Conectar el formulario de la página de contacto y el total de vistas de cada ficha.
- Cuentas: volver a enviar el enlace de confirmación, el acceso con Google, y cambiar el correo o la contraseña desde «Mi cuenta» (hoy la contraseña se cambia con «Olvidé mi contraseña»). Antes de abrir el registro al público hace falta conectar el servicio de correo propio descrito en [Correo](#correo).
- Revisar con un abogado los términos y condiciones y la política de privacidad: hoy son un texto preliminar que describe el sitio tal como funciona, y la página lo avisa.
- Verificar el teléfono del registro con un código por SMS.
- Consultar el tipo de cambio en un servidor: los precios se guardan en dólares y su equivalente en lempiras se calcula con un valor de referencia que hoy se actualiza a mano en `src/shared/constants/currency.ts`.
- Definir el plan para inmobiliarias.
- Proyectos: un botón «Compartir» en su ficha, como el de los anuncios (al pegar el enlace ya sale la vista previa).
- Construir lo que los planes anuncian y aún no existe: el panel del agente con gestión, reportes y métricas, los usuarios por plan, la marca del agente en sus anuncios, y el soporte 24/7.
- Anuncios: decidir si la ficha muestra la dirección exacta o solo la zona.
- Que quien paga elija qué anuncios destacar, con un tope por plan: hoy se destacan todos, por turnos.
- Activar el plan de una cuenta al confirmarse su pago: hoy el equipo le sube el límite de anuncios desde el panel de administración.
- Pagos en línea: cobrar con tarjeta dentro del sitio, activar el plan al confirmarse el pago, renovarlo cada mes y emitir la factura. Hoy la solicitud sale por WhatsApp y el plan se activa a mano.
- Cupones de descuento: definir los códigos y validarlos en un servidor, para que rebajen el total.
- Panel de administración: estadísticas, y ver el registro de moderación desde el sitio (hoy se consulta en la tabla `moderation_log`).
