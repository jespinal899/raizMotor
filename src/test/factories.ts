import { vi } from 'vitest'
import type { PropertyService } from '@/features/properties/services/propertyService'
import type { Property } from '@/features/properties/types/property.types'
import type { Paginated } from '@/shared/types/common.types'

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

/** Varias propiedades con identificador y título numerados: "Propiedad 1", "Propiedad 2"… */
export const buildProperties = (count: number): Property[] =>
  Array.from({ length: count }, (_, position) =>
    buildProperty({ id: `propiedad-${position + 1}`, title: `Propiedad ${position + 1}` }),
  )

/** Una página de resultados; por defecto, la única página que contiene todos los elementos. */
export const buildPage = <T>(items: T[], overrides: Partial<Paginated<T>> = {}): Paginated<T> => ({
  items,
  total: items.length,
  page: 1,
  pageSize: 6,
  totalPages: 1,
  ...overrides,
})

/** Servicio falso: cada método responde vacío salvo que la prueba lo sustituya. */
export const buildPropertyService = (overrides: Partial<PropertyService> = {}): PropertyService => ({
  getFeatured: vi.fn(async () => []),
  search: vi.fn(async () => buildPage<Property>([])),
  getById: vi.fn(async () => undefined),
  ...overrides,
})
