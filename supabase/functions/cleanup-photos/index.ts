// Limpieza de fotos huérfanas: borra del depósito `property-photos` las fotos que ningún anuncio usa desde
// hace más de 24 horas. La llama una vez al día una tarea programada de Supabase Cron, con el secreto
// `CLEANUP_SECRET`. La lógica está en cleanup.ts; aquí solo se conecta con la base de datos y con Storage.
//
// Se publica con: supabase functions deploy cleanup-photos --no-verify-jwt
// (la protege su propio secreto, no una sesión). Cómo programarla está en el README.
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { handleCleanup } from './cleanup.ts'

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

const listOrphans = async (limit: number) => {
  const { data, error } = await supabase.rpc('orphan_photos', { max_rows: limit })
  if (error) throw error

  return ((data ?? []) as { name: string }[]).map((row) => row.name)
}

const countOrphans = async () => {
  const { data, error } = await supabase.rpc('count_orphan_photos')
  if (error) throw error

  return Number(data ?? 0)
}

const removePhotos = async (paths: string[]) => {
  const { data, error } = await supabase.storage.from('property-photos').remove(paths)
  if (error) throw error

  return data?.length ?? 0
}

Deno.serve((request) => handleCleanup(request, { listOrphans, countOrphans, removePhotos, secret: CLEANUP_SECRET }))
