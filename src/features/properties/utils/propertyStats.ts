import type { Property } from '@/features/properties/types/property.types'
import { formatArea } from '@/shared/utils/format'

export type PropertyStatKey = 'bedrooms' | 'bathrooms' | 'parking' | 'area'

export interface PropertyStat {
  key: PropertyStatKey
  text: string
}

type StatSource = Pick<Property, 'bedrooms' | 'bathrooms' | 'parking' | 'area'>

interface StatOptions {
  withParking?: boolean
}

/** Datos numéricos de la propiedad listos para mostrar; omite los que no aplican (p. ej. un terreno). */
export const getPropertyStats = (
  { bedrooms, bathrooms, parking, area }: StatSource,
  { withParking = false }: StatOptions = {},
): PropertyStat[] => {
  const stats: PropertyStat[] = []

  if (bedrooms !== undefined) stats.push({ key: 'bedrooms', text: `${bedrooms} dorm.` })
  if (bathrooms !== undefined) stats.push({ key: 'bathrooms', text: `${bathrooms} ${bathrooms === 1 ? 'baño' : 'baños'}` })
  if (withParking && parking !== undefined) stats.push({ key: 'parking', text: `${parking} estac.` })
  stats.push({ key: 'area', text: formatArea(area) })

  return stats
}
