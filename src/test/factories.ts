import type { Property } from '@/features/properties/types/property.types'

export const buildProperty = (overrides: Partial<Property> = {}): Property => ({
  id: 'propiedad-de-prueba',
  title: 'Casa de prueba',
  type: 'casa',
  operation: 'venta',
  price: 200000,
  district: 'Miraflores',
  city: 'Lima',
  area: 150,
  bedrooms: 3,
  bathrooms: 2,
  image: 'https://example.com/foto.jpg',
  featured: false,
  ...overrides,
})
