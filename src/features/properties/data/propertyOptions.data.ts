import { Building2, House, LandPlot } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type {
  AdvertiserKind,
  PropertyOperation,
  PropertyType,
} from '@/features/properties/types/property.types'

interface PropertyTypeDetails {
  label: string
  plural: string
  slug: string
  icon: LucideIcon
}

export const PROPERTY_TYPES: Record<PropertyType, PropertyTypeDetails> = {
  casa: { label: 'Casa', plural: 'Casas', slug: 'casas', icon: House },
  apartamento: { label: 'Apartamento', plural: 'Apartamentos', slug: 'apartamentos', icon: Building2 },
  terreno: { label: 'Terreno', plural: 'Terrenos', slug: 'terrenos', icon: LandPlot },
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
