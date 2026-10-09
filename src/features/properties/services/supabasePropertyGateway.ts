import type { SupabaseClient } from '@supabase/supabase-js'
import type { PropertyGateway, PropertyRow } from '@/features/properties/services/supabasePropertyRepository'

const PROPERTIES = 'properties'
const PROFILES = 'profiles'
const PHOTOS = 'property-photos'
/** Las fotos no cambian de contenido en su ruta: el navegador puede guardarlas un año. */
const PHOTO_CACHE_SECONDS = '31536000'

/** Lo que responde Supabase: el dato o el fallo, nunca una excepción. Aquí el fallo se convierte en rechazo. */
const unwrap = <Data>({ data, error }: { data: Data; error: Error | null }): Data => {
  if (error) throw error

  return data
}

/**
 * Las consultas a Supabase, y nada más: toda decisión vive en el repositorio. Es el único archivo que
 * conoce los nombres de las tablas y del depósito, que crea `supabase/migrations`.
 */
export const createSupabasePropertyGateway = (client: SupabaseClient): PropertyGateway => {
  const properties = () => client.from(PROPERTIES)
  const photos = () => client.storage.from(PHOTOS)

  return {
    currentUserId: async () => (await client.auth.getSession()).data.session?.user.id ?? null,

    listPublished: async () =>
      unwrap<PropertyRow[] | null>(
        await properties().select('*').eq('status', 'published').order('created_at', { ascending: false }),
      ) ?? [],

    findById: async (id) => unwrap<PropertyRow[] | null>(await properties().select('*').eq('id', id).limit(1))?.[0],

    listByOwner: async (ownerId) =>
      unwrap<PropertyRow[] | null>(
        await properties().select('*').eq('owner_id', ownerId).order('created_at', { ascending: false }),
      ) ?? [],

    findLimit: async (ownerId) =>
      unwrap<{ max_publications: number }[] | null>(
        await client.from(PROFILES).select('max_publications').eq('id', ownerId).limit(1),
      )?.[0]?.max_publications,

    insertOnce: async (row) => {
      unwrap(await properties().upsert(row, { onConflict: 'owner_id,operation_key', ignoreDuplicates: true }))
    },

    updateById: async (id, changes) => {
      unwrap(await properties().update(changes).eq('id', id))
    },

    deleteById: async (id) => {
      unwrap(await properties().delete().eq('id', id))
    },

    uploadPhoto: async (path, photo) => {
      unwrap(
        await photos().upload(path, photo, { upsert: true, contentType: photo.type, cacheControl: PHOTO_CACHE_SECONDS }),
      )
    },

    removePhotos: async (paths) => {
      if (paths.length > 0) unwrap(await photos().remove(paths))
    },

    photoUrl: (path) => photos().getPublicUrl(path).data.publicUrl,
  }
}
