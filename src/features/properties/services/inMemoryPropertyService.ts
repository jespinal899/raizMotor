import type { PropertyService } from '@/features/properties/services/propertyService'
import type { Property } from '@/features/properties/types/property.types'
import { matchesFilters } from '@/features/properties/utils/matchesFilters'

export const createInMemoryPropertyService = (properties: readonly Property[]): PropertyService => ({
  getFeatured: async () => properties.filter((property) => property.featured),
  search: async (filters) => properties.filter((property) => matchesFilters(property, filters)),
  getById: async (id) => properties.find((property) => property.id === id),
})
