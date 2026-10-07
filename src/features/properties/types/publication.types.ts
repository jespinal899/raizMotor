import type { Coordinates, PropertyOperation, PropertyType } from '@/features/properties/types/property.types'

export type { Coordinates } from '@/features/properties/types/property.types'

/** Hacia dónde mira el mapa. */
export interface MapView {
  center: Coordinates
  zoom: number
}

/** Lo que se le pregunta al buscador de direcciones: nombres, no identificadores. */
export interface AddressQuery {
  neighborhood: string
  city: string
  department: string
}

/** Hasta dónde llegó el buscador: la colonia, o solo la ciudad. */
export type AddressPrecision = 'neighborhood' | 'city'

export interface LocatedAddress {
  point: Coordinates
  precision: AddressPrecision
}

/** Datos que dependen del tipo de propiedad: un terreno, por ejemplo, no tiene cuartos. */
export type DetailField = 'builtArea' | 'landArea' | 'bedrooms' | 'bathrooms' | 'parking'

/** Lo que se escribe en el formulario. Los números siguen siendo texto hasta que se validan. */
export interface PublicationFormValues {
  department: string
  city: string
  neighborhood: string
  address: string
  /** Punto marcado en el mapa; `null` hasta que la persona lo coloca. */
  coordinates: Coordinates | null
  type: PropertyType | ''
  builtArea: string
  landArea: string
  bedrooms: string
  bathrooms: string
  /** Opcional: en blanco significa que no se declara, no que sean cero. */
  parking: string
  /** Comodidades marcadas, con el mismo texto con que se ofrecen. */
  features: string[]
  title: string
  description: string
  operation: PropertyOperation | ''
  price: string
  images: File[]
}

/** Publicación validada, lista para enviarse. */
export interface PropertyPublication {
  location: {
    department: string
    city: string
    neighborhood: string
    address: string
    coordinates: Coordinates
  }
  type: PropertyType
  /** En metros cuadrados. */
  builtArea?: number
  /** En metros cuadrados. */
  landArea?: number
  bedrooms?: number
  bathrooms?: number
  parking?: number
  /** Comodidades que declara quien publica, de las que se ofrecen para su tipo de propiedad. */
  features: string[]
  title: string
  description: string
  operation: PropertyOperation
  /** En USD; mensual cuando la operación es alquiler. */
  price: number
  /** La primera es la portada. */
  images: File[]
}

/** `limitReached`: no se guardó porque la publicación gratuita ya estaba usada. */
export type PublicationStatus = 'idle' | 'submitting' | 'published' | 'failed' | 'limitReached'
