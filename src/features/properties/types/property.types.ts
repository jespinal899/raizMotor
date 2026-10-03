export type PropertyType = 'casa' | 'apartamento' | 'terreno'

export type PropertyOperation = 'venta' | 'alquiler'

export type AdvertiserKind = 'particular' | 'inmobiliaria' | 'constructora'

export interface Advertiser {
  name: string
  kind: AdvertiserKind
}

export interface Property {
  id: string
  title: string
  description: string
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
  parking?: number
  features: string[]
  /** Portada para listados. */
  image: string
  /** Fotos en tamaño grande para la página de detalle; la primera es la portada. */
  gallery: string[]
  advertiser: Advertiser
  featured: boolean
}

export interface PropertyFilters {
  type?: PropertyType
  operation?: PropertyOperation
  location?: string
  maxPrice?: number
}
