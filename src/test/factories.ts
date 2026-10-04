import { vi } from 'vitest'
import type { PropertyService } from '@/features/properties/services/propertyService'
import type { Property } from '@/features/properties/types/property.types'
import type { PublicationFormValues } from '@/features/properties/types/publication.types'
import type { Paginated } from '@/shared/types/common.types'

interface ImageFileOptions {
  name?: string
  type?: string
  /** Peso simulado en bytes, para no reservar memoria con un archivo grande de verdad. */
  size?: number
}

export const buildImageFile = ({ name = 'foto.jpg', type = 'image/jpeg', size }: ImageFileOptions = {}): File => {
  const file = new File(['contenido'], name, { type })
  if (size !== undefined) Object.defineProperty(file, 'size', { value: size })

  return file
}

/** Formulario de publicación de una casa con todos sus datos válidos. */
export const buildPublicationValues = (overrides: Partial<PublicationFormValues> = {}): PublicationFormValues => ({
  department: 'francisco-morazan',
  city: 'Tegucigalpa',
  neighborhood: 'Colonia Palmira',
  address: 'Avenida República de Chile, casa 12',
  coordinates: { lat: 14.1, lng: -87.19 },
  type: 'casa',
  builtArea: '180',
  landArea: '250',
  bedrooms: '3',
  bathrooms: '2',
  title: 'Casa amplia con patio en Palmira',
  description: 'Casa de dos plantas con patio amplio, cochera techada y cuarto de servicio.',
  operation: 'venta',
  price: '145000',
  images: [buildImageFile()],
  ...overrides,
})

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
