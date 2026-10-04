import type { PropertyService } from '@/features/properties/services/propertyService'
import type { Property } from '@/features/properties/types/property.types'
import { matchesFilters } from '@/features/properties/utils/matchesFilters'
import { paginate } from '@/shared/utils/pagination'

export const createInMemoryPropertyService = (properties: readonly Property[]): PropertyService => ({
  getFeatured: async () => properties.filter((property) => property.featured),
  search: async (filters, pageRequest) =>
    paginate(
      properties.filter((property) => matchesFilters(property, filters)),
      pageRequest,
    ),
  getById: async (id) => properties.find((property) => property.id === id),
})
