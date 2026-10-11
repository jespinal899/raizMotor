// El mapa del sitio (/sitemap.xml): las páginas públicas y cada anuncio publicado, para que Google los
// encuentre. La lógica está en _lib/seo.ts.
import { handleSitemap } from './_lib/seo'

declare const process: { env: Record<string, string | undefined> }

export const config = { runtime: 'edge' }

export default (request: Request) =>
  handleSitemap(request, {
    fetch,
    supabaseUrl: process.env.VITE_SUPABASE_URL,
    supabaseKey: process.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    siteUrl: process.env.SITE_URL,
  })
