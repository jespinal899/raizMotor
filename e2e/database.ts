/**
 * Cambios que en el sitio hace el equipo (por ejemplo, aprobar un plan), hechos aquí con la clave secreta del
 * Supabase local, por su API. Esa clave solo la usan las pruebas: el sitio nunca la tiene.
 */
const API = process.env.SUPABASE_API_URL ?? 'http://127.0.0.1:54321'

const secretKey = () => {
  const key = process.env.SUPABASE_SECRET_KEY
  if (!key) throw new Error('Falta SUPABASE_SECRET_KEY: sale de `supabase status -o env` (SECRET_KEY).')

  return key
}

const request = async (path: string, init: RequestInit = {}) => {
  const key = secretKey()
  const response = await fetch(`${API}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', ...init.headers },
  })
  if (!response.ok) throw new Error(`La base de datos respondió ${response.status}: ${await response.text()}`)

  return response
}

/** La cuenta que publicó el anuncio con ese título. */
export const ownerOf = async (title: string): Promise<string> => {
  const response = await request(`properties?select=owner_id&title=eq.${encodeURIComponent(title)}&limit=1`)
  const [row] = (await response.json()) as { owner_id: string }[]
  if (!row) throw new Error(`No hay ningún anuncio con el título «${title}».`)

  return row.owner_id
}

/** Cuántos anuncios puede tener publicados la cuenta: más de 1 es un plan de pago. */
export const setPublicationLimit = async (account: string, limit: number) => {
  await request(`profiles?id=eq.${account}`, { method: 'PATCH', body: JSON.stringify({ max_publications: limit }) })
}
