import type { PropertyPublication } from '@/features/properties/types/publication.types'
import type { PublishedPropertyRepository } from '@/features/properties/services/publishedPropertyRepository'
import { publishedPropertyRepository } from '@/features/properties/services/publishedPropertyRepository'

export interface PublicationService {
  /**
   * Se resuelve con el identificador guardado. Repetir una clave devuelve ese mismo identificador.
   */
  publish(publication: PropertyPublication, operationKey: string): Promise<string>
}

export const createPublicationService = (repository: PublishedPropertyRepository): PublicationService => ({
  publish: (publication, operationKey) => repository.publish(publication, operationKey),
})

export const publicationService: PublicationService = createPublicationService(publishedPropertyRepository)
