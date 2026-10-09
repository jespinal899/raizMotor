import { createInMemoryPropertyService } from '@/features/properties/services/inMemoryPropertyService'
import type { PropertyService } from '@/features/properties/services/propertyService'
import type {
  PublishedPropertyRepository,
  StoredPropertyPublication,
} from '@/features/properties/services/publishedPropertyRepository'
import type { Property } from '@/features/properties/types/property.types'
import { getDepartmentName } from '@/features/properties/utils/departments'

interface CatalogOptions {
  /** Los anuncios del repositorio los ve cualquiera, no solo quien los guardó en este navegador. */
  shared?: boolean
}

/**
 * Adapta un anuncio guardado a los datos que consumen la búsqueda y la ficha. Las fotos viajan como están
 * guardadas: una dirección, o el archivo si el anuncio vive en este navegador; en ese caso quien las pinta
 * crea su dirección temporal y la libera al dejar de mostrarlas.
 */
export const toPublishedProperty = (
  { id, publication, advertiser, hidden }: StoredPropertyPublication,
  { shared = false }: CatalogOptions = {},
): Property => {
  const { location, type, operation, builtArea, landArea, bedrooms, bathrooms, parking, title, description, price } =
    publication
  const { images } = publication
  // Los anuncios guardados antes de que se pidieran las comodidades no las traen.
  const features: string[] | undefined = publication.features

  return {
    id,
    title,
    description,
    type,
    operation,
    price,
    district: location.neighborhood,
    city: location.city,
    area: builtArea ?? landArea!,
    builtArea,
    landArea,
    bedrooms,
    bathrooms,
    parking,
    features: features ?? [],
    image: images[0],
    gallery: images,
    location: {
      department: getDepartmentName(location.department) ?? location.department,
      address: location.address,
      coordinates: location.coordinates,
    },
    advertiser,
    featured: false,
    localOnly: !shared,
    hidden,
  }
}

/**
 * Combina los anuncios publicados con el catálogo de ejemplo, cuyas propiedades salen marcadas como tales.
 * El almacén de anuncios es un añadido: si no responde, el catálogo de ejemplo se sigue sirviendo.
 */
export const createPublishedPropertyService = (
  properties: readonly Property[],
  repository: PublishedPropertyRepository,
  options: CatalogOptions = {},
): PropertyService => {
  const examples = properties.map((property) => ({ ...property, example: true }))
  const samples = createInMemoryPropertyService(examples)
  const toProperty = (record: StoredPropertyPublication) => toPublishedProperty(record, options)

  const getPublished = async (): Promise<Property[]> => {
    try {
      return (await repository.getAll()).map(toProperty)
    } catch {
      return []
    }
  }

  const findPublished = async (id: string): Promise<Property | undefined> => {
    try {
      const record = await repository.getById(id)

      return record && toProperty(record)
    } catch {
      return undefined
    }
  }

  return {
    // Un anuncio publicado nunca es destacado, así que la portada no necesita leer el almacén.
    getFeatured: () => samples.getFeatured(),
    search: async (filters, pageRequest) =>
      createInMemoryPropertyService([...(await getPublished()), ...examples]).search(filters, pageRequest),
    getById: async (id) => (await findPublished(id)) ?? samples.getById(id),
    // Aquí un fallo no se calla: decir «no tienes anuncios» a quien sí los tiene sería falso.
    getOwn: async () => (await repository.getOwn()).map(toProperty),
  }
}
