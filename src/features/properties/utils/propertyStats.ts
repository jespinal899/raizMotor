import type { Property } from '@/features/properties/types/property.types'
import { formatArea } from '@/shared/utils/format'

export type PropertyStatKey = 'bedrooms' | 'bathrooms' | 'area'

export interface PropertyStat {
  key: PropertyStatKey
  text: string
}

type StatSource = Pick<Property, PropertyStatKey>

/**
 * Resumen compacto de la propiedad para las tarjetas del catálogo; omite lo que no aplica (p. ej. en un
 * terreno). La ficha muestra estos datos y más, con su nombre completo: ver `getPropertyHighlights`.
 */
export const getPropertyStats = ({ bedrooms, bathrooms, area }: StatSource): PropertyStat[] => {
  const stats: PropertyStat[] = []

  if (bedrooms !== undefined) stats.push({ key: 'bedrooms', text: `${bedrooms} dorm.` })
  if (bathrooms !== undefined) stats.push({ key: 'bathrooms', text: `${bathrooms} ${bathrooms === 1 ? 'baño' : 'baños'}` })
  stats.push({ key: 'area', text: formatArea(area) })

  return stats
}
