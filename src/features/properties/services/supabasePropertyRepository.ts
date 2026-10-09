import {
  PublicationLimitError,
  PublicationSignInRequiredError,
} from '@/features/properties/services/publicationErrors'
import type {
  PublishedPropertyRepository,
  StoredPropertyPublication,
} from '@/features/properties/services/publishedPropertyRepository'
import type { PropertyOperation, PropertyType } from '@/features/properties/types/property.types'
import type { PropertyPublication } from '@/features/properties/types/publication.types'
import { photoExtension } from '@/features/properties/utils/photoResize'
import { MAX_FREE_PUBLICATIONS } from '@/features/properties/utils/publicationLimit'

/** Un anuncio tal como está en la tabla `properties`; lo que no declara llega como `null`. */
export interface PropertyRow {
  id: string
  owner_id: string
  operation_key: string
  created_at: string
  /** `hidden` cuando el equipo del sitio lo retiró del catálogo. */
  status: 'published' | 'hidden'
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

/** Lo que este repositorio necesita de Supabase, sin su manera de escribir las consultas. */
export interface PropertyGateway {
  /** Identificador de la cuenta con la sesión abierta; `null` si no hay ninguna. */
  currentUserId(): Promise<string | null>
  /** Los anuncios que ve cualquiera, del más reciente al más antiguo. */
  listPublished(): Promise<PropertyRow[]>
  findById(id: string): Promise<PropertyRow | undefined>
  /** Los de una cuenta, también los ocultos, del más reciente al más antiguo. */
  listByOwner(ownerId: string): Promise<PropertyRow[]>
  /** Cuántos anuncios admite la cuenta; sin valor si no tiene perfil. */
  findLimit(ownerId: string): Promise<number | undefined>
  /** Guarda el anuncio si su clave no estaba ya guardada: repetirlo no hace nada. Rechaza con el fallo de la base. */
  insertOnce(row: NewPropertyRow): Promise<void>
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

const isLimitReached = (reason: unknown) =>
  typeof reason === 'object' && reason !== null && 'code' in reason && reason.code === LIMIT_REACHED

const toRow = (
  { location, images: _images, builtArea, landArea, bedrooms, bathrooms, parking, ...publication }: PropertyPublication,
  operationKey: string,
  photos: string[],
): NewPropertyRow => ({
  ...publication,
  operation_key: operationKey,
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
    ...(row.status === 'hidden' && { hidden: true }),
  })

  const uploadPhotos = (ownerId: string, operationKey: string, images: File[]) =>
    Promise.all(
      images.map(async (image, position) => {
        const photo = await preparePhoto(image)
        // La ruta sale de la clave de la operación: un reintento reemplaza las mismas fotos, no deja otras.
        const path = `${ownerId}/${operationKey}/${position}.${photoExtension(photo.type)}`
        await gateway.uploadPhoto(path, photo)

        return path
      }),
    )

  return {
    publish: async (publication, operationKey) => {
      const ownerId = await gateway.currentUserId()
      if (!ownerId) throw new PublicationSignInRequiredError()

      const findSaved = async () =>
        (await gateway.listByOwner(ownerId)).find((row) => row.operation_key === operationKey)

      // Un anuncio que ya se guardó con esta clave no se vuelve a subir.
      const saved = await findSaved()
      if (saved) return saved.id

      const photos = await uploadPhotos(ownerId, operationKey, publication.images)
      try {
        await gateway.insertOnce(toRow(publication, operationKey, photos))
      } catch (reason) {
        throw isLimitReached(reason) ? new PublicationLimitError() : reason
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

    getOwn: async () => {
      const ownerId = await gateway.currentUserId()

      return ownerId ? (await gateway.listByOwner(ownerId)).map(toStored) : []
    },

    getLimit: async () => {
      const ownerId = await gateway.currentUserId()
      const limit = ownerId ? await gateway.findLimit(ownerId) : undefined

      return limit ?? MAX_FREE_PUBLICATIONS
    },

    remove: async (id) => {
      const [ownerId, row] = await Promise.all([gateway.currentUserId(), gateway.findById(id)])
      if (!row || row.owner_id !== ownerId) return

      // Primero el anuncio: si después fallara el borrado de las fotos, sobrarían archivos, no un anuncio sin fotos.
      await gateway.deleteById(id)
      await gateway.removePhotos(row.photos)
    },
  }
}
