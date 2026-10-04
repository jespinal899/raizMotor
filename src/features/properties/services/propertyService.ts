import { PROPERTIES } from '@/features/properties/data/properties.data'
import { createInMemoryPropertyService } from '@/features/properties/services/inMemoryPropertyService'
import type { Property, PropertyFilters } from '@/features/properties/types/property.types'
import type { PageRequest, Paginated } from '@/shared/types/common.types'

export interface PropertyService {
  getFeatured(): Promise<Property[]>
  /** Devuelve solo la página pedida, con los totales para paginar. */
  search(filters: PropertyFilters, pageRequest: PageRequest): Promise<Paginated<Property>>
  /** Devuelve `undefined` cuando no existe ninguna propiedad con ese identificador. */
  getById(id: string): Promise<Property | undefined>
}

// Único punto donde se elige la implementación: al conectar la API, se cambia solo esta línea.
export const propertyService: PropertyService = createInMemoryPropertyService(PROPERTIES)
