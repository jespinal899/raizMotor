export type PropertyType = 'casa' | 'apartamento' | 'terreno'

export type PropertyOperation = 'venta' | 'alquiler'

export interface Property {
  id: string
  title: string
  type: PropertyType
  operation: PropertyOperation
  /** En USD; mensual cuando la operación es alquiler. */
  price: number
  district: string
  city: string
  /** En metros cuadrados. */
  area: number
  bedrooms?: number
  bathrooms?: number
  image: string
  featured: boolean
}

export interface PropertyFilters {
  type?: PropertyType
  operation?: PropertyOperation
  location?: string
  maxPrice?: number
}
