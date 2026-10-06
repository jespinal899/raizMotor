import type { PropertyService } from '@/features/properties/services/propertyService'
import type { PublishedPropertyRepository, StoredPropertyPublication } from '@/features/properties/services/publishedPropertyRepository'
import { DEPARTMENTS } from '@/features/properties/data/departments.data'
import type { Property } from '@/features/properties/types/property.types'
import { matchesFilters } from '@/features/properties/utils/matchesFilters'
import { paginate } from '@/shared/utils/pagination'

const imageUrlsById = new Map<string, string[]>()

const getImageUrls = ({ id, publication }: StoredPropertyPublication) => {
  const cached = imageUrlsById.get(id)
  if (cached) return cached

  const urls = publication.images.map((image) => URL.createObjectURL(image))
  imageUrlsById.set(id, urls)
  return urls
}

/** Adapta el formulario a los datos que consumen la búsqueda y la ficha. */
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
      department: DEPARTMENTS.find((department) => department.id === location.department)?.name ?? location.department,
      address: location.address,
      coordinates: location.coordinates,
    },
    featured: false,
  }
}

/** Combina los anuncios guardados en este navegador con el catálogo de ejemplo. */
export const createPublishedPropertyService = (
  properties: readonly Property[],
  repository: PublishedPropertyRepository,
): PropertyService => {
  const getAll = async () => [...(await repository.getAll()).map(toPublishedProperty), ...properties]

  return {
    getFeatured: async () => (await getAll()).filter((property) => property.featured),
    search: async (filters, pageRequest) =>
      paginate(
        (await getAll()).filter((property) => matchesFilters(property, filters)),
        pageRequest,
      ),
    getById: async (id) => {
      const record = await repository.getById(id)
      return record ? toPublishedProperty(record) : properties.find((property) => property.id === id)
    },
  }
}
