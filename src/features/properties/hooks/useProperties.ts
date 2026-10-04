import { propertyService } from '@/features/properties/services/propertyService'
import type { PropertyService } from '@/features/properties/services/propertyService'
import type { PropertyFilters } from '@/features/properties/types/property.types'
import { useAsyncData } from '@/hooks/useAsyncData'
import type { PageRequest } from '@/shared/types/common.types'

export const useProperties = (
  filters: PropertyFilters,
  pageRequest: PageRequest,
  service: PropertyService = propertyService,
) => {
  const { type, operation, location, maxPrice } = filters
  const { page, pageSize } = pageRequest
  const key = `search:${JSON.stringify([type, operation, location, maxPrice, page, pageSize])}`
  const { data, isLoading, error } = useAsyncData(() => service.search(filters, pageRequest), key)

  return {
    properties: data?.items ?? [],
    total: data?.total ?? 0,
    // La página efectiva puede diferir de la pedida si esta estaba fuera de rango.
    page: data?.page ?? page,
    totalPages: data?.totalPages ?? 1,
    isLoading,
    error,
  }
}
