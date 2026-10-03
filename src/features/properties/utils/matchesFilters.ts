import type { Property, PropertyFilters } from '@/features/properties/types/property.types'
import { normalizeText } from '@/shared/utils/text'

export const matchesFilters = (
  property: Property,
  { type, operation, location, maxPrice }: PropertyFilters,
): boolean => {
  if (type && property.type !== type) return false
  if (operation && property.operation !== operation) return false
  if (maxPrice && property.price > maxPrice) return false

  const place = location ? normalizeText(location) : ''
  if (place && !normalizeText(`${property.district} ${property.city}`).includes(place)) return false

  return true
}
