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

/** Un proyecto cargado por el equipo para la cuenta `owner`, ya publicado, con un modelo. Devuelve su identificador. */
export const createProject = async (owner: string, name: string): Promise<string> => {
  const response = await request('projects?select=id', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({
      owner_id: owner,
      status: 'published',
      name,
      developer_name: 'Constructora de prueba',
      developer_phone: '+50499998888',
      description: 'Torre de apartamentos de prueba con piscina, gimnasio y seguridad las 24 horas.',
      kind: 'torre',
      stage: 'preventa',
      delivery_date: '2027-12-01',
      price_from: 95000,
      units_total: 40,
      department: 'cortes',
      city: 'San Pedro Sula',
      neighborhood: 'Colonia Trejo',
      address: '10 calle, frente al parque',
      latitude: 15.5042,
      longitude: -88.025,
      amenities: ['Piscina', 'Gimnasio'],
      photos: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80'],
    }),
  })
  const [{ id }] = (await response.json()) as { id: string }[]
  await request('project_models', {
    method: 'POST',
    body: JSON.stringify({ project_id: id, name: 'Modelo Prueba', bedrooms: 2, bathrooms: 2, area: 85, price_from: 95000 }),
  })

  return id
}

/** Borra un proyecto, con sus modelos. */
export const deleteProject = async (id: string) => {
  await request(`projects?id=eq.${id}`, { method: 'DELETE' })
}

/** Cuántos proyectos puede tener publicados la cuenta: más de 0 es un plan de inmobiliaria. */
export const setProjectLimit = async (account: string, limit: number) => {
  await request(`profiles?id=eq.${account}`, { method: 'PATCH', body: JSON.stringify({ max_projects: limit }) })
}

/** Los reportes que recibió un proyecto, con su estado. */
export const reportsOfProject = async (project: string): Promise<{ reason: string; status: string }[]> => {
  const response = await request(`property_reports?select=reason,status&project_id=eq.${project}`)

  return (await response.json()) as { reason: string; status: string }[]
}
