// Limpieza de fotos huérfanas: borra de los depósitos `property-photos` y `project-photos` las fotos que ningún
// anuncio ni proyecto usa desde hace más de 24 horas. La llama una vez al día una tarea programada de Supabase Cron, con el secreto
// `CLEANUP_SECRET`. La lógica está en cleanup.ts; aquí solo se conecta con la base de datos y con Storage.
//
// Se publica con: supabase functions deploy cleanup-photos --no-verify-jwt
// (la protege su propio secreto, no una sesión). Cómo programarla está en el README.
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { combineBuckets, handleCleanup } from './cleanup.ts'
import type { PhotoBucket } from './cleanup.ts'

const required = (name: string): string => {
  const value = Deno.env.get(name)?.trim()
  if (!value) throw new Error(`Falta el secreto ${name}.`)

  return value
}

const CLEANUP_SECRET = required('CLEANUP_SECRET')
if (CLEANUP_SECRET.length < 32) throw new Error('CLEANUP_SECRET tiene que tener al menos 32 caracteres.')

const supabase = createClient(required('SUPABASE_URL'), required('SUPABASE_SERVICE_ROLE_KEY'), {
  auth: { persistSession: false },
})

/** Un depósito, con las funciones de la base de datos que dicen qué sobra en él (supabase/migrations). */
const bucket = (name: string, list: string, count: string): PhotoBucket => ({
  bucket: name,
  listOrphans: async (limit) => {
    const { data, error } = await supabase.rpc(list, { max_rows: limit })
    if (error) throw error

    return ((data ?? []) as { name: string }[]).map((row) => row.name)
  },
  countOrphans: async () => {
    const { data, error } = await supabase.rpc(count)
    if (error) throw error

    return Number(data ?? 0)
  },
  removePhotos: async (paths) => {
    const { data, error } = await supabase.storage.from(name).remove(paths)
    if (error) throw error

    return data?.length ?? 0
  },
})

const photos = combineBuckets([
  bucket('property-photos', 'orphan_photos', 'count_orphan_photos'),
  bucket('project-photos', 'orphan_project_photos', 'count_orphan_project_photos'),
])

Deno.serve((request) => handleCleanup(request, { ...photos, secret: CLEANUP_SECRET }))
