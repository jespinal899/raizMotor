import type { Property, PropertySort } from '@/features/properties/types/property.types'

type Comparator = (first: Property, second: Property) => number

const COMPARATORS: Record<PropertySort, Comparator> = {
  'price-asc': (first, second) => first.price - second.price,
  'price-desc': (first, second) => second.price - first.price,
  'area-desc': (first, second) => second.area - first.area,
}

/**
 * Las propiedades en el orden pedido, sin tocar la lista recibida. Sin orden vienen como estaban, y las
 * que empatan conservan entre ellas el orden en que venían.
 */
export const sortProperties = (properties: readonly Property[], sort?: PropertySort): Property[] =>
  sort ? properties.toSorted(COMPARATORS[sort]) : [...properties]
