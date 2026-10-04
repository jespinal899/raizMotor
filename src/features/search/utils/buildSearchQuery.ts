import { PROPERTY_TYPES } from '@/features/properties/data/propertyOptions.data'
import type { PropertyFilters } from '@/features/properties/types/property.types'
import { findPropertyTypeBySlug, isPropertyOperation } from '@/features/properties/utils/propertyGuards'
import { ROUTES, propertyTypePath } from '@/shared/constants/routes'

const PARAMS = {
  operation: 'operacion',
  location: 'ubicacion',
  maxPrice: 'precioMax',
  page: 'pagina',
} as const

const FIRST_PAGE = 1

const parsePositiveNumber = (value: string | null) => {
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? number : undefined
}

/** La primera página no se escribe en la URL: es la misma dirección que la búsqueda sin paginar. */
export const buildSearchPath = (
  { type, operation, location, maxPrice }: PropertyFilters,
  page: number = FIRST_PAGE,
): string => {
  const path = type ? propertyTypePath(PROPERTY_TYPES[type].slug) : ROUTES.properties

  const params = new URLSearchParams()
  if (operation) params.set(PARAMS.operation, operation)
  if (location?.trim()) params.set(PARAMS.location, location.trim())
  if (maxPrice) params.set(PARAMS.maxPrice, String(maxPrice))
  if (page > FIRST_PAGE) params.set(PARAMS.page, String(page))

  const query = params.toString()
  return query ? `${path}?${query}` : path
}

export const parseSearchFilters = (typeSlug: string | undefined, params: URLSearchParams): PropertyFilters => {
  const operation = params.get(PARAMS.operation)

  return {
    type: findPropertyTypeBySlug(typeSlug),
    operation: isPropertyOperation(operation) ? operation : undefined,
    location: params.get(PARAMS.location)?.trim() || undefined,
    maxPrice: parsePositiveNumber(params.get(PARAMS.maxPrice)),
  }
}

export const parseSearchPage = (params: URLSearchParams): number => {
  const page = Number(params.get(PARAMS.page))
  return Number.isInteger(page) && page >= FIRST_PAGE ? page : FIRST_PAGE
}
