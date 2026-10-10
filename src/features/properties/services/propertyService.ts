import { PROPERTIES } from '@/features/properties/data/properties.data'
import { ADS_SHARED, propertyRepository } from '@/features/properties/services/propertyRepository'
import { createPublishedPropertyService } from '@/features/properties/services/publishedPropertyService'
import type { Property, PropertyFilters } from '@/features/properties/types/property.types'
import { showSampleListings } from '@/features/properties/utils/sampleListings'
import type { PageRequest, Paginated } from '@/shared/types/common.types'

export interface PropertyService {
  getFeatured(): Promise<Property[]>
  /** Devuelve solo la página pedida, con los totales para paginar. */
  search(filters: PropertyFilters, pageRequest: PageRequest): Promise<Paginated<Property>>
  /** Devuelve `undefined` cuando no existe ninguna propiedad con ese identificador. */
  getById(id: string): Promise<Property | undefined>
  /** Los anuncios de quien usa el sitio, del más reciente al más antiguo. Rechaza si no se pudieron leer. */
  getOwn(): Promise<Property[]>
}

// Los anuncios publicados se suman al catálogo de ejemplo, que sale marcado como tal, si se muestra.
export const propertyService: PropertyService = createPublishedPropertyService(
  showSampleListings(ADS_SHARED, import.meta.env) ? PROPERTIES : [],
  propertyRepository,
  { shared: ADS_SHARED },
)
