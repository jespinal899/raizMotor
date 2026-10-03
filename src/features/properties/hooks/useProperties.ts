import { propertyService } from '@/features/properties/services/propertyService'
import type { PropertyService } from '@/features/properties/services/propertyService'
import type { PropertyFilters } from '@/features/properties/types/property.types'
import { useAsyncData } from '@/hooks/useAsyncData'

export const useProperties = (filters: PropertyFilters, service: PropertyService = propertyService) => {
  const { type, operation, location, maxPrice } = filters
  const key = `search:${JSON.stringify([type, operation, location, maxPrice])}`
  const { data, isLoading, error } = useAsyncData(() => service.search(filters), key)

  return { properties: data ?? [], isLoading, error }
}
