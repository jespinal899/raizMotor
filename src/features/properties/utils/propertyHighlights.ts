import type { Property } from '@/features/properties/types/property.types'
import { formatArea } from '@/shared/utils/format'

export type PropertyHighlightKey = 'bedrooms' | 'bathrooms' | 'parking' | 'builtArea' | 'landArea' | 'area'

export interface PropertyHighlight {
  key: PropertyHighlightKey
  label: string
  value: string
}

type HighlightSource = Pick<Property, PropertyHighlightKey>

interface HighlightDefinition {
  key: PropertyHighlightKey
  label: string
  format: (amount: number) => string
}

const asCount = (amount: number) => String(amount)

/** En el orden en que se muestran. */
const DEFINITIONS: HighlightDefinition[] = [
  { key: 'bedrooms', label: 'Dormitorios', format: asCount },
  { key: 'bathrooms', label: 'Baños', format: asCount },
  { key: 'parking', label: 'Estacionamientos', format: asCount },
  { key: 'builtArea', label: 'Superficie construida', format: formatArea },
  { key: 'landArea', label: 'Superficie del terreno', format: formatArea },
  { key: 'area', label: 'Superficie', format: formatArea },
]

/**
 * Datos principales de una propiedad con su nombre completo, para la ficha. Omite los que no aplican
 * (un terreno no tiene dormitorios) y la superficie general cuando ya se detallan la construida o la del terreno.
 */
export const getPropertyHighlights = (property: HighlightSource): PropertyHighlight[] => {
  const hasDetailedAreas = property.builtArea !== undefined || property.landArea !== undefined

  return DEFINITIONS.flatMap(({ key, label, format }) => {
    const amount = property[key]
    if (amount === undefined || (key === 'area' && hasDetailedAreas)) return []

    return [{ key, label, value: format(amount) }]
  })
}
