import type { SupabaseClient } from '@supabase/supabase-js'
import type { ProjectModelRow, ProjectRow } from '@/features/projects/services/projectGateway'

/** Lo que el sitio escribe de un proyecto. De quién es, su estado y sus fechas los fija la base de datos. */
export type ProjectChanges = Omit<ProjectRow, 'id' | 'owner_id' | 'operation_key' | 'status'>

export type NewProjectRow = ProjectChanges & { operation_key: string }

export type ModelChanges = Omit<ProjectModelRow, 'position'>

/** Lo que el servicio de «Mis proyectos» necesita de Supabase, sin su manera de escribir las consultas. */
export interface MyProjectsGateway {
  currentUserId(): Promise<string | null>
  /** Cuántos proyectos admite la cuenta; sin valor si no tiene perfil. */
  findLimit(ownerId: string): Promise<number | undefined>
  /** Los de la cuenta, también los borradores y los ocultos, del más reciente al más antiguo. */
  listByOwner(ownerId: string): Promise<ProjectRow[]>
  /** Un proyecto que la cuenta puede ver, con sus modelos. */
  findById(id: string): Promise<{ row: ProjectRow; models: ProjectModelRow[] } | undefined>
  findByOperationKey(ownerId: string, operationKey: string): Promise<ProjectRow | undefined>
  /** Guarda el proyecto si su clave no estaba ya guardada: repetirlo no hace nada. */
  insertOnce(row: NewProjectRow): Promise<void>
  updateById(id: string, changes: ProjectChanges): Promise<void>
  /** Deja exactamente estos modelos, en este orden. */
  replaceModels(projectId: string, models: ModelChanges[]): Promise<void>
  setStatus(id: string, status: 'published' | 'draft'): Promise<void>
  deleteById(id: string): Promise<void>
  uploadPhoto(path: string, photo: Blob): Promise<void>
  removePhotos(paths: string[]): Promise<void>
  photoUrl(path: string): string
}

const PROJECTS = 'projects'
const MODELS = 'project_models'
const PHOTOS = 'project-photos'
const PHOTO_CACHE_SECONDS = '31536000'

const unwrap = <Data>({ data, error }: { data: Data; error: Error | null }): Data => {
  if (error) throw error

  return data
}

/**
 * Las consultas de «Mis proyectos» a Supabase. Qué puede hacer cada cuenta lo deciden las políticas y los
 * disparadores de supabase/migrations/20261017000000_proyectos_de_inmobiliarias.sql.
 */
export const createSupabaseMyProjectsGateway = (client: SupabaseClient): MyProjectsGateway => {
  const projects = () => client.from(PROJECTS)
  const photos = () => client.storage.from(PHOTOS)

  return {
    currentUserId: async () => (await client.auth.getSession()).data.session?.user.id ?? null,

    findLimit: async (ownerId) =>
      unwrap<{ max_projects: number }[] | null>(await client.from('profiles').select('max_projects').eq('id', ownerId).limit(1))?.[0]
        ?.max_projects,

    listByOwner: async (ownerId) =>
      unwrap<ProjectRow[] | null>(
        await projects().select('*').eq('owner_id', ownerId).order('created_at', { ascending: false }).limit(100),
      ) ?? [],

    findById: async (id) => {
      const [row] = unwrap<ProjectRow[] | null>(await projects().select('*').eq('id', id).limit(1)) ?? []
      if (!row) return undefined

      const models =
        unwrap<ProjectModelRow[] | null>(
          await client
            .from(MODELS)
            .select('name, bedrooms, bathrooms, area, price_from, position')
            .eq('project_id', id)
            .order('position', { ascending: true }),
        ) ?? []

      return { row, models }
    },

    findByOperationKey: async (ownerId, operationKey) =>
      unwrap<ProjectRow[] | null>(
        await projects().select('*').eq('owner_id', ownerId).eq('operation_key', operationKey).limit(1),
      )?.[0],

    insertOnce: async (row) => {
      const { error } = await projects().upsert(row, { onConflict: 'owner_id,operation_key', ignoreDuplicates: true })
      if (error) throw error
    },

    updateById: async (id, changes) => {
      const { error } = await projects().update(changes).eq('id', id)
      if (error) throw error
    },

    replaceModels: async (projectId, models) => {
      const removed = await client.from(MODELS).delete().eq('project_id', projectId)
      if (removed.error) throw removed.error
      if (models.length === 0) return

      const { error } = await client
        .from(MODELS)
        .insert(models.map((model, position) => ({ ...model, project_id: projectId, position })))
      if (error) throw error
    },

    setStatus: async (id, status) => {
      const { error } = await projects().update({ status }).eq('id', id)
      if (error) throw error
    },

    deleteById: async (id) => {
      const { error } = await projects().delete().eq('id', id)
      if (error) throw error
    },

    uploadPhoto: async (path, photo) => {
      const { error } = await photos().upload(path, photo, {
        upsert: true,
        contentType: photo.type,
        cacheControl: PHOTO_CACHE_SECONDS,
      })
      if (error) throw error
    },

    removePhotos: async (paths) => {
      if (paths.length === 0) return
      const { error } = await photos().remove(paths)
      if (error) throw error
    },

    photoUrl: (path) =>
      /^https:\/\//.test(path) ? path : photos().getPublicUrl(path).data.publicUrl,
  }
}
