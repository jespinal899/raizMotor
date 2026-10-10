import {
  PublicationLimitError,
  PublicationSignInRequiredError,
} from '@/features/properties/services/publicationErrors'
import { NOT_EDITABLE } from '@/features/properties/services/publishedPropertyRepository'
import type {
  PublishedPropertyRepository,
  StoredPropertyPublication,
} from '@/features/properties/services/publishedPropertyRepository'
import type {
  PropertyFilters,
  PropertyOperation,
  PropertySort,
  PropertyType,
  Withdrawal,
} from '@/features/properties/types/property.types'
import type { PropertyPublication, PublicationPhoto } from '@/features/properties/types/publication.types'
import { photoExtension } from '@/features/properties/utils/photoResize'
import { MAX_FREE_PUBLICATIONS } from '@/features/properties/utils/publicationLimit'
import { normalizeText } from '@/shared/utils/text'

/** Un anuncio tal como está en la tabla `properties`; lo que no declara llega como `null`. */
export interface PropertyRow {
  id: string
  owner_id: string
  operation_key: string
  created_at: string
  /** Fuera del catálogo está `unpublished`, si lo retiró quien lo publicó, o `hidden`, si fue el equipo del sitio. */
  status: 'published' | 'unpublished' | 'hidden'
  title: string
  description: string
  type: PropertyType
  operation: PropertyOperation
  price: number
  department: string
  city: string
  neighborhood: string
  address: string
  latitude: number
  longitude: number
  built_area: number | null
  land_area: number | null
  bedrooms: number | null
  bathrooms: number | null
  parking: number | null
  features: string[]
  /** Rutas dentro del depósito de fotos; la primera es la portada. */
  photos: string[]
  advertiser_name: string
  advertiser_phone: string
}

/** Lo que el sitio escribe de un anuncio. De quién es y con qué nombre se anuncia lo fija la base de datos. */
export type NewPropertyRow = Omit<
  PropertyRow,
  'id' | 'owner_id' | 'created_at' | 'status' | 'advertiser_name' | 'advertiser_phone'
>

/** Lo que se puede cambiar de un anuncio ya publicado: todo menos la clave con que se publicó. */
export type PropertyChanges = Omit<NewPropertyRow, 'operation_key'>

/**
 * Una búsqueda en el catálogo, tal como la entiende la base de datos. `place` llega ya normalizado, sin
 * mayúsculas ni tildes, igual que la columna `search_place` con que se compara.
 */
export interface CatalogSearch {
  type?: PropertyType
  operation?: PropertyOperation
  place?: string
  minPrice?: number
  maxPrice?: number
  minBedrooms?: number
  minBathrooms?: number
  sort?: PropertySort
  offset: number
  limit: number
}

/** Lo que este repositorio necesita de Supabase, sin su manera de escribir las consultas. */
export interface PropertyGateway {
  /** Identificador de la cuenta con la sesión abierta; `null` si no hay ninguna. */
  currentUserId(): Promise<string | null>
  /** Los anuncios que ve cualquiera, del más reciente al más antiguo. */
  listPublished(): Promise<PropertyRow[]>
  /** El tramo pedido de los anuncios publicados que cumplen la búsqueda, y cuántos la cumplen en total. */
  searchPublished(search: CatalogSearch): Promise<{ rows: PropertyRow[]; total: number }>
  findById(id: string): Promise<PropertyRow | undefined>
  /** Los de una cuenta, también los ocultos, del más reciente al más antiguo. */
  listByOwner(ownerId: string): Promise<PropertyRow[]>
  /** Cuántos anuncios admite la cuenta; sin valor si no tiene perfil. */
  findLimit(ownerId: string): Promise<number | undefined>
  /** Guarda el anuncio si su clave no estaba ya guardada: repetirlo no hace nada. Rechaza con el fallo de la base. */
  insertOnce(row: NewPropertyRow): Promise<void>
  /** Guarda los cambios de un anuncio. Lo que identifica al anuncio lo conserva la base de datos. */
  updateById(id: string, changes: PropertyChanges): Promise<void>
  /**
   * Publica o despublica un anuncio, sin tocar nada más. Rechaza con el fallo de la base, que al publicar
   * puede ser el del límite del plan.
   */
  setStatus(id: string, status: 'published' | 'unpublished'): Promise<void>
  deleteById(id: string): Promise<void>
  /** Deja la foto en esa ruta; si ya había una, la reemplaza. */
  uploadPhoto(path: string, photo: Blob): Promise<void>
  removePhotos(paths: string[]): Promise<void>
  /** Dirección pública de una foto guardada. */
  photoUrl(path: string): string
}

interface SupabasePropertyOptions {
  gateway: PropertyGateway
  /** Deja la foto lista para subirla: reducida, para que el catálogo no pese. */
  preparePhoto: (photo: File) => Promise<Blob>
}

/** Código con el que la base de datos dice que el plan de la cuenta no admite más anuncios. */
const LIMIT_REACHED = 'RZ001'
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
/** Con qué nombre se presenta una cuenta que no guardó el suyo. */
const UNNAMED_ADVERTISER = 'Anunciante'
/** Lo que se responde a quien quiere publicar o despublicar un anuncio que ocultó el equipo. */
const WITHDRAWN_BY_SITE = 'El equipo del sitio retiró este anuncio.'
/** Quién retiró del catálogo un anuncio, según su estado en la base. */
const WITHDRAWALS: Record<PropertyRow['status'], Withdrawal | undefined> = {
  published: undefined,
  unpublished: 'byOwner',
  hidden: 'bySite',
}

const isLimitReached = (reason: unknown) =>
  typeof reason === 'object' && reason !== null && 'code' in reason && reason.code === LIMIT_REACHED

/** El fallo con que rechazar: el del límite del plan, con su nombre, o el que llegó. */
const toFailure = (reason: unknown) => (isLimitReached(reason) ? new PublicationLimitError() : reason)

/**
 * La zona que se busca, como la compara la base de datos. Sin los comodines de la búsqueda por patrones
 * (`%`, `_`, `*`) ni la barra con que se escaparían: ningún nombre de lugar los lleva, y escritos a propósito
 * harían que la búsqueda encontrara cualquier cosa.
 */
const toPlace = (location: string | undefined) => normalizeText(location ?? '').replace(/[%_*\\]/g, '') || undefined

const toCatalogSearch = (
  { location, type, operation, minPrice, maxPrice, minBedrooms, minBathrooms, sort }: PropertyFilters,
  offset: number,
  limit: number,
): CatalogSearch => ({
  type,
  operation,
  place: toPlace(location),
  minPrice,
  maxPrice,
  minBedrooms,
  minBathrooms,
  sort,
  offset,
  limit,
})

const toChanges = (
  { location, images: _images, builtArea, landArea, bedrooms, bathrooms, parking, ...publication }: PropertyPublication,
  photos: string[],
): PropertyChanges => ({
  ...publication,
  department: location.department,
  city: location.city,
  neighborhood: location.neighborhood,
  address: location.address,
  latitude: location.coordinates.lat,
  longitude: location.coordinates.lng,
  // Lo que no aplica al tipo de propiedad se guarda sin valor: un cero diría algo que nadie declaró.
  built_area: builtArea ?? null,
  land_area: landArea ?? null,
  bedrooms: bedrooms ?? null,
  bathrooms: bathrooms ?? null,
  parking: parking ?? null,
  photos,
})

/** Anuncios guardados en Supabase: los ve cualquiera y cada uno es de la cuenta que lo publicó. */
export const createSupabasePropertyRepository = ({
  gateway,
  preparePhoto,
}: SupabasePropertyOptions): PublishedPropertyRepository => {
  const toStored = (row: PropertyRow): StoredPropertyPublication => ({
    id: row.id,
    operationKey: row.operation_key,
    createdAt: Date.parse(row.created_at),
    publication: {
      location: {
        department: row.department,
        city: row.city,
        neighborhood: row.neighborhood,
        address: row.address,
        coordinates: { lat: row.latitude, lng: row.longitude },
      },
      type: row.type,
      builtArea: row.built_area ?? undefined,
      landArea: row.land_area ?? undefined,
      bedrooms: row.bedrooms ?? undefined,
      bathrooms: row.bathrooms ?? undefined,
      parking: row.parking ?? undefined,
      features: row.features,
      title: row.title,
      description: row.description,
      operation: row.operation,
      price: row.price,
      images: row.photos.map(gateway.photoUrl),
    },
    advertiser: {
      name: row.advertiser_name || UNNAMED_ADVERTISER,
      kind: 'particular',
      ...(row.advertiser_phone && { phone: row.advertiser_phone }),
    },
    ...(WITHDRAWALS[row.status] && { withdrawn: WITHDRAWALS[row.status] }),
  })

  /**
   * Deja guardadas las fotos del anuncio y entrega sus rutas, en el mismo orden. Las que ya tenía (`kept`,
   * por su dirección) conservan su ruta; las nuevas se suben.
   */
  const storePhotos = (
    ownerId: string,
    operationKey: string,
    images: PublicationPhoto[],
    kept = new Map<string, string>(),
  ) =>
    Promise.all(
      images.map(async (image, position) => {
        if (typeof image === 'string') {
          const saved = kept.get(image)
          // Solo vale la dirección de una foto que el anuncio ya tenía: ninguna otra se guarda como suya.
          if (!saved) throw new Error('Esa foto no pertenece al anuncio.')

          return saved
        }

        const photo = await preparePhoto(image)
        // La ruta sale de la clave de la operación: un reintento reemplaza las mismas fotos, no deja otras.
        const path = `${ownerId}/${operationKey}/${position}.${photoExtension(photo.type)}`
        await gateway.uploadPhoto(path, photo)

        return path
      }),
    )

  /** El anuncio y de quién es la sesión. Rechaza si no hay sesión o el anuncio no es de esa cuenta. */
  const requireOwn = async (id: string) => {
    const [ownerId, row] = await Promise.all([gateway.currentUserId(), gateway.findById(id)])
    if (!ownerId) throw new PublicationSignInRequiredError()
    if (!row || row.owner_id !== ownerId) throw new Error(NOT_EDITABLE)

    return { ownerId, row }
  }

  const setStatus = async (id: string, status: 'published' | 'unpublished') => {
    const { row } = await requireOwn(id)
    // Lo que ocultó el equipo solo lo devuelve el equipo. La base lo dejaría igual sin avisar: aquí se dice.
    if (row.status === 'hidden') throw new Error(WITHDRAWN_BY_SITE)

    try {
      await gateway.setStatus(id, status)
    } catch (reason) {
      throw toFailure(reason)
    }
  }

  return {
    publish: async (publication, operationKey) => {
      const ownerId = await gateway.currentUserId()
      if (!ownerId) throw new PublicationSignInRequiredError()

      const findSaved = async () =>
        (await gateway.listByOwner(ownerId)).find((row) => row.operation_key === operationKey)

      // Un anuncio que ya se guardó con esta clave no se vuelve a subir.
      const saved = await findSaved()
      if (saved) return saved.id

      const photos = await storePhotos(ownerId, operationKey, publication.images)
      try {
        await gateway.insertOnce({ ...toChanges(publication, photos), operation_key: operationKey })
      } catch (reason) {
        throw toFailure(reason)
      }

      const created = await findSaved()
      if (!created) throw new Error('El anuncio no quedó guardado.')

      return created.id
    },

    // El catálogo de ejemplo usa otros identificadores: por ellos no hace falta preguntar.
    getById: async (id) => {
      const row = UUID.test(id) ? await gateway.findById(id) : undefined

      return row && toStored(row)
    },

    getAll: async () => (await gateway.listPublished()).map(toStored),

    search: async ({ filters, offset, limit }) => {
      const { rows, total } = await gateway.searchPublished(toCatalogSearch(filters, offset, limit))

      return { records: rows.map(toStored), total }
    },

    getOwn: async () => {
      const ownerId = await gateway.currentUserId()

      return ownerId ? (await gateway.listByOwner(ownerId)).map(toStored) : []
    },

    getLimit: async () => {
      const ownerId = await gateway.currentUserId()
      const limit = ownerId ? await gateway.findLimit(ownerId) : undefined

      return limit ?? MAX_FREE_PUBLICATIONS
    },

    update: async (id, publication, operationKey) => {
      const { ownerId, row } = await requireOwn(id)
      const kept = new Map(row.photos.map((path) => [gateway.photoUrl(path), path]))
      // Las nuevas van a una carpeta con la clave de esta edición: reintentarla reemplaza las mismas.
      const photos = await storePhotos(ownerId, operationKey, publication.images, kept)
      await gateway.updateById(id, toChanges(publication, photos))
      // Las que el anuncio ya no usa se borran al final: si fallara, sobrarían archivos, no faltarían fotos.
      await gateway.removePhotos(row.photos.filter((path) => !photos.includes(path)))
    },

    unpublish: (id) => setStatus(id, 'unpublished'),

    republish: (id) => setStatus(id, 'published'),

    remove: async (id) => {
      const [ownerId, row] = await Promise.all([gateway.currentUserId(), gateway.findById(id)])
      if (!row || row.owner_id !== ownerId) return

      // Primero el anuncio: si después fallara el borrado de las fotos, sobrarían archivos, no un anuncio sin fotos.
      await gateway.deleteById(id)
      await gateway.removePhotos(row.photos)
    },
  }
}
