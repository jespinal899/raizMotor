// /robots.txt: qué páginas no deben indexar los buscadores y dónde está el mapa del sitio. La lógica está en
// _lib/seo.ts.
import { handleRobots } from './_lib/seo'

declare const process: { env: Record<string, string | undefined> }

export const config = { runtime: 'edge' }

export default (request: Request) => handleRobots(request, process.env.SITE_URL)
