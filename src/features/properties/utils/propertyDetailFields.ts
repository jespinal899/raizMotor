import type { PropertyType } from '@/features/properties/types/property.types'
import type { DetailField } from '@/features/properties/types/publication.types'

const DETAIL_FIELDS: Record<PropertyType, DetailField[]> = {
  casa: ['builtArea', 'landArea', 'bedrooms', 'bathrooms'],
  apartamento: ['builtArea', 'bedrooms', 'bathrooms'],
  terreno: ['landArea'],
}

/** Datos que se piden según el tipo de propiedad; ninguno mientras no se haya elegido. */
export const getDetailFields = (type: PropertyType | ''): DetailField[] => (type === '' ? [] : DETAIL_FIELDS[type])
