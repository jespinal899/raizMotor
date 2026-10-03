import { vi } from 'vitest'
import type { PropertyService } from '@/features/properties/services/propertyService'
import type { Property } from '@/features/properties/types/property.types'

export const buildProperty = (overrides: Partial<Property> = {}): Property => ({
  id: 'propiedad-de-prueba',
  title: 'Casa de prueba',
  description: 'Descripción de prueba.',
  type: 'casa',
  operation: 'venta',
  price: 200000,
  district: 'Miraflores',
  city: 'Lima',
  area: 150,
  bedrooms: 3,
  bathrooms: 2,
  parking: 1,
  features: ['Jardín', 'Terraza'],
  image: 'https://example.com/portada.jpg',
  gallery: ['https://example.com/foto-1.jpg', 'https://example.com/foto-2.jpg'],
  advertiser: { name: 'Anunciante de prueba', kind: 'particular' },
  featured: false,
  ...overrides,
})

/** Servicio falso: cada método responde vacío salvo que la prueba lo sustituya. */
export const buildPropertyService = (overrides: Partial<PropertyService> = {}): PropertyService => ({
  getFeatured: vi.fn(async () => []),
  search: vi.fn(async () => []),
  getById: vi.fn(async () => undefined),
  ...overrides,
})
