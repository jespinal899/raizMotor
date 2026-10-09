# DomusRaíz

[![CI/CD](https://github.com/jespinal899/raizMotor/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/jespinal899/raizMotor/actions/workflows/ci-cd.yml)

Plataforma web inmobiliaria para Honduras: reúne casas, apartamentos y terrenos en un solo lugar para publicarlos, encontrarlos y contactar a quien los anuncia, sin comisiones ocultas.

**Sitio publicado:** https://raiz-motor.vercel.app/

## Estado actual

Las cuentas y los anuncios funcionan con [Supabase](https://supabase.com/). Un anuncio publicado lo ve cualquier visitante, a nombre de la cuenta que lo publicó, y se suma a las propiedades de ejemplo, que salen marcadas como «Ejemplo». Las demás funciones que necesitan un servicio externo muestran un aviso en lugar de simular el resultado.

Sin las variables de Supabase en la compilación, el sitio sigue funcionando sin cuentas y cada anuncio se guarda solo en el navegador de quien lo publica, que lo ve avisado.

| Función | Estado |
| --- | --- |
| Portada: carrusel, propiedades destacadas, Quiénes somos y Cómo funciona | Funciona |
| Búsqueda por tipo, operación, zona, precio, dormitorios y baños, con orden y paginación | Funciona sobre los anuncios publicados y los de ejemplo. Se filtra en el navegador, que recibe el catálogo entero: sirve mientras sean cientos de anuncios |
| Precios en dólares y en lempiras | Funciona; los lempiras se calculan con un tipo de cambio de referencia fijo |
| Ficha de una propiedad | Muestra los anuncios publicados y los de ejemplo; se comparte por WhatsApp o enlace y, si el anuncio tiene su punto en el mapa, abre la ruta en Google Maps |
| Contactar a quien publica | La ficha de un anuncio publicado dice quién lo publica y abre WhatsApp con el teléfono de su cuenta y el anuncio ya citado. Los de ejemplo llevan al contacto del sitio |
| Cotizar una propiedad desde su ficha | Interfaz lista; falta el servidor que reciba la solicitud |
| Reportar una publicación desde su ficha | Interfaz lista; falta el servidor que reciba el reporte |
| Vistas de una ficha | Cuenta solo las visitas hechas desde este navegador, y lo dice; falta el servidor que sume las de todos |
| Publicar una propiedad: formulario por pasos con mapa, estacionamientos y comodidades | Se llega desde los planes y pide iniciar sesión. Guarda el anuncio en Supabase con hasta 10 fotos, que se reducen antes de subirlas, y queda visible de inmediato. Cada cuenta admite los anuncios de su plan: uno con el gratuito |
| Mis anuncios | Cada cuenta ve los suyos, y puede corregirlos o eliminarlos; eliminar uno deja libre su lugar en el plan |
| Editar un anuncio | El mismo formulario de publicar, abierto con sus datos: se cambia lo que haga falta, también las fotos. Solo lo edita quien lo publicó, y no puede cambiar su estado ni su anunciante |
| Mi cuenta | Cada cuenta corrige su nombre y su teléfono; sus anuncios pasan a mostrarlos. El correo y la contraseña no se cambian desde ahí |
| Contacto | Interfaz lista; falta el servicio de correo |
| Registro, inicio y cierre de sesión | Funcionan con Supabase cuando la compilación tiene sus dos variables (ver [Cuentas](#cuentas)); sin ellas, los formularios avisan de que aún no están disponibles. Quien se registra debe confirmar su correo antes de entrar; la barra muestra de quién es la sesión |
| Acceso con Google | El botón avisa de que aún no está disponible: falta dar de alta el sitio en Google |
| Recuperar contraseña | Funciona con Supabase: se pide un enlace por correo y, al abrirlo, se elige otra contraseña. Un enlace caducado o ya usado lleva a una página que lo explica y ofrece pedir otro |
| Términos y condiciones, y política de privacidad | Texto preliminar; pendiente de revisión legal |
| Planes: Propietario, Agente inmobiliario e Inmobiliarias | El botón «Publicar» lleva aquí. Propietario abre el formulario (1 publicación gratis), Agente inmobiliario abre sus planes mensuales e Inmobiliarias abre el contacto |
| Planes para agentes inmobiliarios (Agente Pro y Agente Élite): precio mensual en lempiras y motivos para contratar | Se muestran; el botón de cada plan abre su página de contratación |
| Contratar un plan de agente en tres pasos (datos de suscripción, resumen y medio de pago), con el resumen de compra y su ISV siempre a un lado | Abre WhatsApp con la solicitud ya escrita; el pago se coordina a mano, porque aún no hay pagos en línea ni cuentas. La pantalla de pago con tarjeta es una demostración de diseño que no cobra nada y solo existe al desarrollar (`npm run dev`), no en el sitio publicado |
| Código de descuento al contratar un plan | Solo el espacio para escribirlo, en el resumen de compra: aún no existen códigos, así que cualquiera responde que no es válido |
| Panel de administración | Sin implementar |

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

Los textos en español de los dos correos están en `supabase/templates/`; cada archivo dice en qué plantilla del panel se pega y con qué asunto.

#### Base de datos

Las tablas, sus permisos y el depósito de fotos se crean con los archivos de [`supabase/migrations`](supabase/migrations/README.md), que se pegan en el SQL Editor del panel de Supabase. Son idempotentes: repetirlos no cambia nada. Allí se explica también cómo ocultar un anuncio y cómo dar más anuncios a una cuenta que contrató un plan, que hoy se hace a mano.

#### Pruebas

Las pruebas nunca hablan con el proyecto real, aunque exista `.env.local`: la configuración de Vitest (`vite.config.ts`) deja vacías las dos variables, y lo que necesita cuentas usa un servicio simulado.

## Comandos

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Arranca el servidor de desarrollo. |
| `npm test` | Ejecuta todas las pruebas una vez. |
| `npm run test:watch` | Ejecuta las pruebas y las repite al guardar. |
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
│   └── admin/           Panel de administración (sin implementar)
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

Antes de subir un cambio, comprueba en tu equipo los mismos pasos:

```bash
npm run lint
npm test
npm run build
```

El archivo `vercel.json` también hace que cualquier dirección del sitio entregue la aplicación, para que funcionen los enlaces directos y recargar una página.

## Pendiente

- Conectar un servidor para compartir anuncios entre dispositivos y visitantes, además del envío de contactos, cotizaciones y reportes, y el total de vistas de cada ficha.
- Cuentas: volver a enviar el enlace de confirmación, el acceso con Google, y cambiar el correo o la contraseña desde «Mi cuenta» (hoy la contraseña se cambia con «Olvidé mi contraseña»). Antes de abrir el registro al público hace falta conectar el servicio de correo propio descrito en [Correo](#correo).
- Revisar con un abogado los términos y condiciones y la política de privacidad: hoy son un texto preliminar que describe el sitio tal como funciona, y la página lo avisa.
- Verificar el teléfono del registro con un código por SMS.
- Consultar el tipo de cambio en un servidor: los precios se guardan en dólares y su equivalente en lempiras se calcula con un valor de referencia que hoy se actualiza a mano en `src/shared/constants/currency.ts`.
- Definir el plan para inmobiliarias.
- Construir lo que los planes anuncian y aún no existe: el panel del agente con gestión, reportes y métricas, los usuarios por plan, la marca del agente en sus anuncios, y el soporte 24/7.
- Anuncios: buscar en el servidor cuando el catálogo crezca (hoy el navegador recibe todos los anuncios, hasta 1000, y filtra él), decidir si la ficha muestra la dirección exacta o solo la zona, y retirar las propiedades de ejemplo cuando haya suficientes anuncios reales.
- Activar el plan de una cuenta al confirmarse su pago: hoy se le sube el límite de anuncios a mano en el panel de Supabase.
- Pagos en línea: cobrar con tarjeta dentro del sitio, activar el plan al confirmarse el pago, renovarlo cada mes y emitir la factura. Hoy la solicitud sale por WhatsApp y el plan se activa a mano.
- Cupones de descuento: definir los códigos y validarlos en un servidor, para que rebajen el total.
- Panel de administración.
