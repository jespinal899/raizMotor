import { createInMemoryPropertyService } from '@/features/properties/services/inMemoryPropertyService'
import type { PropertyService } from '@/features/properties/services/propertyService'
import type {
  PublishedPropertyRepository,
  StoredPropertyPublication,
} from '@/features/properties/services/publishedPropertyRepository'
import type { Property } from '@/features/properties/types/property.types'
import { getDepartmentName } from '@/features/properties/utils/departments'

const imageUrlsById = new Map<string, string[]>()

const getImageUrls = ({ id, publication }: StoredPropertyPublication) => {
  const cached = imageUrlsById.get(id)
  if (cached) return cached

  const urls = publication.images.map((image) => URL.createObjectURL(image))
  imageUrlsById.set(id, urls)
  return urls
}

/** Adapta un anuncio guardado a los datos que consumen la búsqueda y la ficha. */
export const toPublishedProperty = (record: StoredPropertyPublication): Property => {
  const { id, publication } = record
  const { location, type, operation, builtArea, landArea, bedrooms, bathrooms, title, description, price } = publication
  const gallery = getImageUrls(record)

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
    features: [],
    image: gallery[0],
    gallery,
    location: {
      department: getDepartmentName(location.department) ?? location.department,
      address: location.address,
      coordinates: location.coordinates,
    },
    featured: false,
  }
}

/**
 * Combina los anuncios guardados en este navegador con el catálogo de ejemplo. El almacenamiento local es
 * un añadido: si el navegador lo bloquea o falla, el catálogo de ejemplo se sigue sirviendo.
 */
export const createPublishedPropertyService = (
  properties: readonly Property[],
  repository: PublishedPropertyRepository,
): PropertyService => {
  const samples = createInMemoryPropertyService(properties)

  const getPublished = async (): Promise<Property[]> => {
    try {
      return (await repository.getAll()).map(toPublishedProperty)
    } catch {
      return []
    }
  }

  const findPublished = async (id: string): Promise<Property | undefined> => {
    try {
      const record = await repository.getById(id)

      return record && toPublishedProperty(record)
    } catch {
      return undefined
    }
  }

  return {
    // Un anuncio local nunca es destacado, así que la portada no necesita leer el almacenamiento.
    getFeatured: () => samples.getFeatured(),
    search: async (filters, pageRequest) =>
      createInMemoryPropertyService([...(await getPublished()), ...properties]).search(filters, pageRequest),
    getById: async (id) => (await findPublished(id)) ?? samples.getById(id),
  }
}
