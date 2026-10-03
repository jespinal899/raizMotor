import { propertyService } from '@/features/properties/services/propertyService'
import type { PropertyService } from '@/features/properties/services/propertyService'
import { useAsyncData } from '@/hooks/useAsyncData'

export const useFeaturedProperties = (service: PropertyService = propertyService) => {
  const { data, isLoading, error } = useAsyncData(() => service.getFeatured(), 'featured')

  return { properties: data ?? [], isLoading, error }
}
