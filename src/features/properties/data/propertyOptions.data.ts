import type {
  AdvertiserKind,
  PropertyOperation,
  PropertyType,
} from '@/features/properties/types/property.types'

export const PROPERTY_TYPES: Record<PropertyType, { label: string; plural: string; slug: string }> = {
  casa: { label: 'Casa', plural: 'Casas', slug: 'casas' },
  apartamento: { label: 'Apartamento', plural: 'Apartamentos', slug: 'apartamentos' },
  terreno: { label: 'Terreno', plural: 'Terrenos', slug: 'terrenos' },
}

export const OPERATIONS: Record<PropertyOperation, { label: string; action: string }> = {
  venta: { label: 'Venta', action: 'Comprar' },
  alquiler: { label: 'Alquiler', action: 'Alquilar' },
}

export const ADVERTISER_KINDS: Record<AdvertiserKind, string> = {
  particular: 'Particular',
  inmobiliaria: 'Inmobiliaria',
  constructora: 'Constructora',
}

export const MAX_PRICE_OPTIONS: Record<PropertyOperation, number[]> = {
  venta: [100000, 200000, 350000, 500000],
  alquiler: [700, 1000, 1500, 2500],
}
