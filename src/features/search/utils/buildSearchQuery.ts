import { PROPERTY_TYPES } from '@/features/properties/data/propertyOptions.data'
import type { PropertyFilters } from '@/features/properties/types/property.types'
import {
  findPropertyTypeBySlug,
  isPropertyOperation,
  isPropertySort,
} from '@/features/properties/utils/propertyGuards'
import { ROUTES, propertyTypePath } from '@/shared/constants/routes'

const PARAMS = {
  operation: 'operacion',
  location: 'ubicacion',
  minPrice: 'precioMin',
  maxPrice: 'precioMax',
  minBedrooms: 'dormitorios',
  minBathrooms: 'banos',
  sort: 'orden',
  page: 'pagina',
} as const

const FIRST_PAGE = 1

const parsePositiveNumber = (value: string | null) => {
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? number : undefined
}

/** Para las cantidades que se cuentan, como los dormitorios: medio dormitorio no es un filtro válido. */
const parsePositiveInteger = (value: string | null) => {
  const number = parsePositiveNumber(value)
  return Number.isInteger(number) ? number : undefined
}

/** La primera página no se escribe en la URL: es la misma dirección que la búsqueda sin paginar. */
export const buildSearchPath = (
  { type, operation, location, minPrice, maxPrice, minBedrooms, minBathrooms, sort }: PropertyFilters,
  page: number = FIRST_PAGE,
): string => {
  const path = type ? propertyTypePath(PROPERTY_TYPES[type].slug) : ROUTES.properties

  const params = new URLSearchParams()
  if (operation) params.set(PARAMS.operation, operation)
  if (location?.trim()) params.set(PARAMS.location, location.trim())
  if (minPrice) params.set(PARAMS.minPrice, String(minPrice))
  if (maxPrice) params.set(PARAMS.maxPrice, String(maxPrice))
  if (minBedrooms) params.set(PARAMS.minBedrooms, String(minBedrooms))
  if (minBathrooms) params.set(PARAMS.minBathrooms, String(minBathrooms))
  if (sort) params.set(PARAMS.sort, sort)
  if (page > FIRST_PAGE) params.set(PARAMS.page, String(page))

  const query = params.toString()
  return query ? `${path}?${query}` : path
}

export const parseSearchFilters = (typeSlug: string | undefined, params: URLSearchParams): PropertyFilters => {
  const operation = params.get(PARAMS.operation)
  const sort = params.get(PARAMS.sort)

  return {
    type: findPropertyTypeBySlug(typeSlug),
    operation: isPropertyOperation(operation) ? operation : undefined,
    location: params.get(PARAMS.location)?.trim() || undefined,
    minPrice: parsePositiveNumber(params.get(PARAMS.minPrice)),
    maxPrice: parsePositiveNumber(params.get(PARAMS.maxPrice)),
    minBedrooms: parsePositiveInteger(params.get(PARAMS.minBedrooms)),
    minBathrooms: parsePositiveInteger(params.get(PARAMS.minBathrooms)),
    sort: isPropertySort(sort) ? sort : undefined,
  }
}

export const parseSearchPage = (params: URLSearchParams): number => {
  const page = Number(params.get(PARAMS.page))
  return Number.isInteger(page) && page >= FIRST_PAGE ? page : FIRST_PAGE
}
