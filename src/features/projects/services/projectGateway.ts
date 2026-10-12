import type { SupabaseClient } from '@supabase/supabase-js'
import type { ProjectKind, ProjectStage } from '@/features/projects/types/project.types'

/** Un proyecto tal como está en la tabla `projects`; lo que no declara llega como `null`. */
export interface ProjectRow {
  id: string
  owner_id: string
  name: string
  developer_name: string
  developer_phone: string
  description: string
  kind: ProjectKind
  stage: ProjectStage
  delivery_date: string | null
  price_from: number
  units_total: number | null
  department: string
  city: string
  neighborhood: string
  address: string
  latitude: number
  longitude: number
  amenities: string[]
  /** Rutas dentro del depósito `project-photos`, o direcciones https completas; la primera es la portada. */
  photos: string[]
  video_url: string | null
  /** Solo los que publica una inmobiliaria desde el sitio; los que carga el equipo no la tienen. */
  operation_key?: string | null
  status?: 'published' | 'draft' | 'hidden'
}

/** Un modelo de unidad tal como está en la tabla `project_models`. */
export interface ProjectModelRow {
  name: string
  bedrooms: number | null
  bathrooms: number | null
  area: number
  price_from: number
  position: number
}

/** Lo que el servicio de proyectos necesita de Supabase, sin su manera de escribir las consultas. */
export interface ProjectGateway {
  /** Los proyectos publicados, del más reciente al más antiguo. */
  listPublished(): Promise<ProjectRow[]>
  /** Los destacados de la portada, como mucho `limit`, que elige la base de datos entre los de planes de pago. */
  listFeatured(limit: number): Promise<ProjectRow[]>
  /** Un proyecto publicado con sus modelos, del más barato al más caro; sin valor si no existe. */
  findById(id: string): Promise<{ row: ProjectRow; models: ProjectModelRow[] } | undefined>
  /** Dirección pública de una foto: tal cual si ya es una dirección completa. */
  photoUrl(path: string): string
}

const PROJECTS = 'projects'
const MODELS = 'project_models'
const PHOTOS = 'project-photos'
/** Filas por petición al leer una lista entera. Igual al «Max Rows» del proyecto: con más, Supabase cortaría. */
const READ_BATCH = 100

const unwrap = <Data>({ data, error }: { data: Data; error: Error | null }): Data => {
  if (error) throw error

  return data
}

/**
 * Las consultas a Supabase de los proyectos, y nada más. Las tablas, la función y el depósito los crea
 * supabase/migrations/20261016000000_proyectos.sql.
 */
export const createSupabaseProjectGateway = (client: SupabaseClient): ProjectGateway => ({
  listPublished: async () => {
    const rows: ProjectRow[] = []
    for (let from = 0; ; from += READ_BATCH) {
      const batch =
        unwrap<ProjectRow[] | null>(
          await client
            .from(PROJECTS)
            .select('*')
            .eq('status', 'published')
            .order('created_at', { ascending: false })
            .order('id', { ascending: true })
            .range(from, from + READ_BATCH - 1),
        ) ?? []
      rows.push(...batch)
      if (batch.length < READ_BATCH) return rows
    }
  },

  listFeatured: async (limit) =>
    unwrap<ProjectRow[] | null>(await client.rpc('featured_projects', { max_count: limit })) ?? [],

  findById: async (id) => {
    const [row] =
      unwrap<ProjectRow[] | null>(await client.from(PROJECTS).select('*').eq('status', 'published').eq('id', id).limit(1)) ?? []
    if (!row) return undefined

    const models =
      unwrap<ProjectModelRow[] | null>(
        await client
          .from(MODELS)
          .select('name, bedrooms, bathrooms, area, price_from, position')
          .eq('project_id', id)
          .order('position', { ascending: true })
          .order('price_from', { ascending: true }),
      ) ?? []

    return { row, models }
  },

  photoUrl: (path) =>
    /^https:\/\//.test(path) ? path : client.storage.from(PHOTOS).getPublicUrl(path).data.publicUrl,
})
