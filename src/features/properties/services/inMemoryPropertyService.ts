import type { PropertyService } from '@/features/properties/services/propertyService'
import type { Property } from '@/features/properties/types/property.types'
import { matchesFilters } from '@/features/properties/utils/matchesFilters'
import { sortProperties } from '@/features/properties/utils/sortProperties'
import { paginate } from '@/shared/utils/pagination'

export const createInMemoryPropertyService = (properties: readonly Property[]): PropertyService => ({
  getFeatured: async () => properties.filter((property) => property.featured),
  search: async (filters, pageRequest) =>
    // Se ordena antes de paginar: el orden es de toda la búsqueda, no de cada página.
    paginate(
      sortProperties(
        properties.filter((property) => matchesFilters(property, filters)),
        filters.sort,
      ),
      pageRequest,
    ),
  getById: async (id) => properties.find((property) => property.id === id),
  // Un catálogo en memoria no es de nadie.
  getOwn: async () => [],
})
