import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  CatalogSearch,
  PropertyGateway,
  PropertyRow,
} from '@/features/properties/services/supabasePropertyRepository'
import type { PropertySort } from '@/features/properties/types/property.types'

const PROPERTIES = 'properties'
const PROFILES = 'profiles'
const PHOTOS = 'property-photos'
/** Las fotos no cambian de contenido en su ruta: el navegador puede guardarlas un año. */
const PHOTO_CACHE_SECONDS = '31536000'

/** Columna y sentido de cada orden del catálogo; sin orden elegido, del más reciente al más antiguo. */
const ORDERS: Record<PropertySort | 'recent', { column: string; ascending: boolean }> = {
  recent: { column: 'created_at', ascending: false },
  'price-asc': { column: 'price', ascending: true },
  'price-desc': { column: 'price', ascending: false },
  // `area` la calcula la base: la superficie construida o, si no tiene, la del terreno.
  'area-desc': { column: 'area', ascending: false },
}

/** Filas por petición al leer una lista entera. Igual al «Max Rows» del proyecto: con más, Supabase cortaría. */
const READ_BATCH = 100

/** Lo que responde Supabase cuando se pide un tramo que empieza después del último anuncio. */
const RANGE_NOT_SATISFIABLE = 'PGRST103'

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

  /** Del más reciente al más antiguo, y siempre en el mismo orden entre los que empatan: así ningún tramo se solapa. */
  const newestFirst = <Query extends { order: (column: string, options: { ascending: boolean }) => Query }>(
    query: Query,
  ) => query.order('created_at', { ascending: false }).order('id', { ascending: true })

  /**
   * Todas las filas de una consulta, de tramo en tramo: Supabase entrega como mucho `READ_BATCH` por respuesta
   * (Max Rows), y lo que pase de ahí se quedaría fuera sin avisar.
   */
  const readAll = async (
    readBatch: (from: number, to: number) => PromiseLike<{ data: PropertyRow[] | null; error: Error | null }>,
  ) => {
    const rows: PropertyRow[] = []
    for (let from = 0; ; from += READ_BATCH) {
      const batch = unwrap(await readBatch(from, from + READ_BATCH - 1)) ?? []
      rows.push(...batch)
      if (batch.length < READ_BATCH) return rows
    }
  }

  /** Los anuncios publicados que cumplen la búsqueda. `head` pide solo cuántos son, sin traer ninguno. */
  const matching = (search: CatalogSearch, head = false) => {
    let query = properties().select('*', { count: 'exact', head }).eq('status', 'published')
    if (search.type) query = query.eq('type', search.type)
    if (search.operation) query = query.eq('operation', search.operation)
    if (search.place) query = query.ilike('search_place', `%${search.place}%`)
    if (search.minPrice) query = query.gte('price', search.minPrice)
    if (search.maxPrice) query = query.lte('price', search.maxPrice)
    // Un anuncio que no declara cuartos o baños, como un terreno, no llega a ningún mínimo.
    if (search.minBedrooms !== undefined) query = query.gte('bedrooms', search.minBedrooms)
    if (search.minBathrooms !== undefined) query = query.gte('bathrooms', search.minBathrooms)

    return query
  }

  return {
    currentUserId: async () => (await client.auth.getSession()).data.session?.user.id ?? null,

    listPublished: () => readAll((from, to) => newestFirst(properties().select('*').eq('status', 'published')).range(from, to)),

    searchPublished: async (search) => {
      const { column, ascending } = ORDERS[search.sort ?? 'recent']
      // Los empates se desempatan siempre igual: si no, un anuncio podría salir en dos páginas, o en ninguna.
      const { data, count, error } = await matching(search)
        .order(column, { ascending, nullsFirst: false })
        .order('created_at', { ascending: false })
        .order('id', { ascending: true })
        .range(search.offset, search.offset + search.limit - 1)

      if (error?.code === RANGE_NOT_SATISFIABLE) {
        // La página pedida ya no existe, p. ej. porque se retiraron anuncios: se dice cuántos hay, para ajustarla.
        const counted = await matching(search, true)
        if (counted.error) throw counted.error

        return { rows: [], total: counted.count ?? 0 }
      }
      if (error) throw error

      return { rows: (data as PropertyRow[] | null) ?? [], total: count ?? 0 }
    },

    findById: async (id) => unwrap<PropertyRow[] | null>(await properties().select('*').eq('id', id).limit(1))?.[0],

    listByOwner: (ownerId) =>
      readAll((from, to) => newestFirst(properties().select('*').eq('owner_id', ownerId)).range(from, to)),

    findByOperationKey: async (ownerId, operationKey) =>
      unwrap<PropertyRow[] | null>(
        await properties().select('*').eq('owner_id', ownerId).eq('operation_key', operationKey).limit(1),
      )?.[0],

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

    setStatus: async (id, status) => {
      unwrap(await properties().update({ status }).eq('id', id))
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
