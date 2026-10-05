# DomusRaíz

[![CI/CD](https://github.com/jespinal899/raizMotor/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/jespinal899/raizMotor/actions/workflows/ci-cd.yml)

Plataforma web inmobiliaria para Honduras: reúne casas, apartamentos y terrenos en un solo lugar para publicarlos, encontrarlos y contactar a quien los anuncia, sin comisiones ocultas.

**Sitio publicado:** https://jespinal899.github.io/raizMotor/

## Estado actual

Todavía no hay servidor propio ni base de datos. El catálogo funciona con propiedades de ejemplo, y las funciones que necesitan un servicio real muestran un aviso en lugar de simular el resultado.

| Función | Estado |
| --- | --- |
| Portada: carrusel, propiedades destacadas, Quiénes somos y Cómo funciona | Funciona |
| Búsqueda con filtros y paginación | Funciona con el catálogo de ejemplo |
| Ficha de una propiedad | Funciona con el catálogo de ejemplo |
| Publicar una propiedad: formulario por pasos con mapa | Interfaz lista; falta el servicio de anuncios |
| Contacto | Interfaz lista; falta el servicio de correo |
| Iniciar sesión, registro y acceso con Google | Interfaz lista; falta el servicio de cuentas |
| Recuperar contraseña | Solo avisa de que aún no está disponible |
| Planes | Contenido provisional |
| Panel de administración | Sin implementar |

## Tecnologías

- **Interfaz:** React 19, TypeScript 6 y React Router 7.
- **Estilos:** Tailwind CSS 4 y componentes de shadcn/ui (estilo `base-nova`, sobre Base UI).
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
- **Contenedores:** el sitio estático en GitHub Pages y la aplicación que se ejecuta en el navegador.
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
- **Servicios intercambiables.** Cada servicio declara un contrato y elige su implementación en una sola línea. Si el servicio real no existe, la implementación provisional rechaza la operación y la pantalla lo avisa.
- **Idempotencia.** Repetir una acción no la duplica: un envío en curso o ya hecho no se repite, y toda escritura lleva una clave de operación. Las reglas están en [docs/arquitectura.md](docs/arquitectura.md#idempotencia).
- **Pruebas primero.** Cada comportamiento se escribe con su prueba, junto al código (`Componente.test.tsx`), con los bloques `// Arrange`, `// Act` y `// Assert` a la vista.
- **Componentes.** Función flecha con `export default`. Los de interfaz base se añaden con `npx shadcn@latest add <nombre>`.
- **Idioma.** Identificadores en inglés; textos de la interfaz, comentarios y pruebas en español.
- **Commits.** [Conventional Commits](https://www.conventionalcommits.org/es/) en español, con un cambio lógico por commit: `feat(auth): agrega el registro con correo`.

## Integración y despliegue continuos

Cada push a `master` ejecuta el pipeline de `.github/workflows/ci-cd.yml`: linter, pruebas, compilación y publicación en GitHub Pages. En un pull request se ejecuta todo menos la publicación.

Antes de subir un cambio, comprueba en tu equipo los mismos pasos:

```bash
npm run lint
npm test
npm run build -- --base="/raizMotor/"
```

El sitio se sirve bajo `/raizMotor/`, por eso la compilación recibe esa base. En Git Bash, antepón `MSYS_NO_PATHCONV=1` al último comando para que no convierta la base en una ruta de Windows.

## Pendiente

- Decidir el servidor y conectar cuentas, publicación de anuncios y envío del contacto.
- Verificar el teléfono del registro con un código por SMS.
- Alinear el catálogo de ejemplo con Honduras: hoy usa propiedades de Lima y el formato regional `es-PE`.
- Confirmar el contenido de los planes.
- Panel de administración y pagos.
