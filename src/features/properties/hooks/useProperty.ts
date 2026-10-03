import { propertyService } from '@/features/properties/services/propertyService'
import type { PropertyService } from '@/features/properties/services/propertyService'
import { useAsyncData } from '@/hooks/useAsyncData'

export const useProperty = (id: string, service: PropertyService = propertyService) => {
  const { data, isLoading, error } = useAsyncData(() => service.getById(id), `property:${id}`)

  return { property: data, isLoading, error }
}
