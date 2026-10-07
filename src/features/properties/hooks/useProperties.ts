import { propertyService } from '@/features/properties/services/propertyService'
import type { PropertyService } from '@/features/properties/services/propertyService'
import type { PropertyFilters } from '@/features/properties/types/property.types'
import { useAsyncData } from '@/hooks/useAsyncData'
import type { PageRequest } from '@/shared/types/common.types'

/**
 * Identifica una búsqueda por lo que pide, con todos sus filtros: así ninguno nuevo se queda sin aplicar
 * por no estar en una lista. No depende del orden en que lleguen ni de los que vienen sin valor.
 */
const toSearchKey = (filters: PropertyFilters, { page, pageSize }: PageRequest) => {
  const applied = Object.entries(filters)
    .filter(([, value]) => value !== undefined)
    .sort(([first], [second]) => first.localeCompare(second))

  return `search:${JSON.stringify([applied, page, pageSize])}`
}

export const useProperties = (
  filters: PropertyFilters,
  pageRequest: PageRequest,
  service: PropertyService = propertyService,
) => {
  const { data, isLoading, error } = useAsyncData(
    () => service.search(filters, pageRequest),
    toSearchKey(filters, pageRequest),
  )

  return {
    properties: data?.items ?? [],
    total: data?.total ?? 0,
    // La página efectiva puede diferir de la pedida si esta estaba fuera de rango.
    page: data?.page ?? pageRequest.page,
    totalPages: data?.totalPages ?? 1,
    isLoading,
    error,
  }
}
