export type PropertyType = 'casa' | 'apartamento' | 'terreno'

export type PropertyOperation = 'venta' | 'alquiler'

export type AdvertiserKind = 'particular' | 'inmobiliaria' | 'constructora'

export interface Coordinates {
  lat: number
  lng: number
}

export interface PropertyLocation {
  department: string
  address: string
  coordinates: Coordinates
}

/** Una foto: su dirección web o, en un anuncio guardado en este navegador, el propio archivo. */
export type PhotoSource = string | Blob

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
  /** Superficie declarada, cuando procede para el tipo de propiedad. */
  builtArea?: number
  landArea?: number
  bedrooms?: number
  bathrooms?: number
  parking?: number
  features: string[]
  /** Portada para listados. */
  image: PhotoSource
  /** Fotos en tamaño grande para la página de detalle; la primera es la portada. */
  gallery: PhotoSource[]
  /** Dirección exacta que se confirmó al publicar; el catálogo de ejemplo no la incluye. */
  location?: PropertyLocation
  advertiser?: Advertiser
  featured: boolean
  /** Guardada solo en este navegador: nadie más puede verla todavía. */
  localOnly?: boolean
}

/** Orden de los resultados de una búsqueda. Sin él se conserva el del catálogo. */
export type PropertySort = 'price-asc' | 'price-desc' | 'area-desc'

/** Lo que se pide en una búsqueda: qué propiedades entran y en qué orden se muestran. */
export interface PropertyFilters {
  type?: PropertyType
  operation?: PropertyOperation
  location?: string
  minPrice?: number
  maxPrice?: number
  /** Deja fuera lo que no declara dormitorios, como los terrenos. */
  minBedrooms?: number
  /** Deja fuera lo que no declara baños. */
  minBathrooms?: number
  sort?: PropertySort
}
