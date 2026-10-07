import { createInMemoryPropertyService } from '@/features/properties/services/inMemoryPropertyService'
import type { PropertyService } from '@/features/properties/services/propertyService'
import type {
  PublishedPropertyRepository,
  StoredPropertyPublication,
} from '@/features/properties/services/publishedPropertyRepository'
import type { Property } from '@/features/properties/types/property.types'
import { getDepartmentName } from '@/features/properties/utils/departments'

/**
 * Adapta un anuncio guardado a los datos que consumen la búsqueda y la ficha. Las fotos viajan como los
 * archivos guardados: quien las pinta crea su dirección temporal y la libera al dejar de mostrarlas.
 */
export const toPublishedProperty = ({ id, publication }: StoredPropertyPublication): Property => {
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
    featured: false,
    localOnly: true,
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
