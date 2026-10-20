// La ficha de un proyecto con su cabecera completa: título, descripción, foto y datos para Google. vercel.json
// lleva aquí cada /proyectos/:id. La lógica está en _lib/seo.ts.
import { handleProjectPage } from './_lib/seo'

declare const process: { env: Record<string, string | undefined> }

export const config = { runtime: 'edge' }

export default (request: Request) =>
  handleProjectPage(request, {
    fetch,
    supabaseUrl: process.env.VITE_SUPABASE_URL,
    supabaseKey: process.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    siteUrl: process.env.SITE_URL,
  })
