import { PROPERTIES } from '@/features/properties/data/properties.data'
import { createPublishedPropertyService } from '@/features/properties/services/publishedPropertyService'
import { publishedPropertyRepository } from '@/features/properties/services/publishedPropertyRepository'
import type { Property, PropertyFilters } from '@/features/properties/types/property.types'
import type { PageRequest, Paginated } from '@/shared/types/common.types'

export interface PropertyService {
  getFeatured(): Promise<Property[]>
  /** Devuelve solo la página pedida, con los totales para paginar. */
  search(filters: PropertyFilters, pageRequest: PageRequest): Promise<Paginated<Property>>
  /** Devuelve `undefined` cuando no existe ninguna propiedad con ese identificador. */
  getById(id: string): Promise<Property | undefined>
}

// Los anuncios locales complementan el catálogo provisional hasta conectar una API.
export const propertyService: PropertyService = createPublishedPropertyService(PROPERTIES, publishedPropertyRepository)
