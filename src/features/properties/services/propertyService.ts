import { PROPERTIES } from '@/features/properties/data/properties.data'
import { createInMemoryPropertyService } from '@/features/properties/services/inMemoryPropertyService'
import type { Property, PropertyFilters } from '@/features/properties/types/property.types'

export interface PropertyService {
  getFeatured(): Promise<Property[]>
  search(filters: PropertyFilters): Promise<Property[]>
}

// Único punto donde se elige la implementación: al conectar la API, se cambia solo esta línea.
export const propertyService: PropertyService = createInMemoryPropertyService(PROPERTIES)
