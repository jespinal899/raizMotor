import type { Property, PropertyFilters } from '@/features/properties/types/property.types'
import { normalizeText } from '@/shared/utils/text'

/** Lo que no declara un dato (un terreno no tiene dormitorios) no llega a ningún mínimo. */
const reaches = (value: number | undefined, minimum: number | undefined) =>
  minimum === undefined || (value !== undefined && value >= minimum)

/** Dice si la propiedad entra en la búsqueda. El orden de los resultados no deja fuera a ninguna. */
export const matchesFilters = (
  property: Property,
  { type, operation, location, minPrice, maxPrice, minBedrooms, minBathrooms }: PropertyFilters,
): boolean => {
  if (type && property.type !== type) return false
  if (operation && property.operation !== operation) return false
  if (minPrice && property.price < minPrice) return false
  if (maxPrice && property.price > maxPrice) return false
  if (!reaches(property.bedrooms, minBedrooms)) return false
  if (!reaches(property.bathrooms, minBathrooms)) return false

  const place = location ? normalizeText(location) : ''
  if (place && !normalizeText(`${property.district} ${property.city}`).includes(place)) return false

  return true
}
