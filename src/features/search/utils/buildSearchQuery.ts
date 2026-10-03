import { PROPERTY_TYPES } from '@/features/properties/data/propertyOptions.data'
import type { PropertyFilters } from '@/features/properties/types/property.types'
import { findPropertyTypeBySlug, isPropertyOperation } from '@/features/properties/utils/propertyGuards'
import { ROUTES, propertyTypePath } from '@/shared/constants/routes'

const PARAMS = {
  operation: 'operacion',
  location: 'ubicacion',
  maxPrice: 'precioMax',
} as const

const parsePositiveNumber = (value: string | null) => {
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? number : undefined
}

export const buildSearchPath = ({ type, operation, location, maxPrice }: PropertyFilters): string => {
  const path = type ? propertyTypePath(PROPERTY_TYPES[type].slug) : ROUTES.properties

  const params = new URLSearchParams()
  if (operation) params.set(PARAMS.operation, operation)
  if (location?.trim()) params.set(PARAMS.location, location.trim())
  if (maxPrice) params.set(PARAMS.maxPrice, String(maxPrice))

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
