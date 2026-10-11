// La ficha de un anuncio con su cabecera completa: título, descripción, foto y datos para Google. vercel.json
// lleva aquí cada /propiedad/:id. La lógica está en _lib/seo.ts.
import { handlePropertyPage } from './_lib/seo'

declare const process: { env: Record<string, string | undefined> }

export const config = { runtime: 'edge' }

export default (request: Request) =>
  handlePropertyPage(request, {
    fetch,
    supabaseUrl: process.env.VITE_SUPABASE_URL,
    supabaseKey: process.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    siteUrl: process.env.SITE_URL,
  })
