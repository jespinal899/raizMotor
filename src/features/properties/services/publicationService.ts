import type { PropertyPublication } from '@/features/properties/types/publication.types'
import type { PublishedPropertyRepository } from '@/features/properties/services/publishedPropertyRepository'
import { publishedPropertyRepository } from '@/features/properties/services/publishedPropertyRepository'
import { hasReachedFreeLimit } from '@/features/properties/utils/publicationLimit'

/** La publicación gratuita ya estaba usada: el anuncio no se guardó, y reintentar no cambia el resultado. */
export class PublicationLimitError extends Error {
  constructor() {
    super('El plan gratuito ya no admite más publicaciones.')
    this.name = 'PublicationLimitError'
  }
}

export interface PublicationService {
  /**
   * Se resuelve con el identificador guardado. Repetir una clave devuelve ese mismo identificador.
   * Rechaza con `PublicationLimitError` si el anuncio es nuevo y la publicación gratuita ya se usó.
   */
  publish(publication: PropertyPublication, operationKey: string): Promise<string>
  /** Identificadores de los anuncios publicados desde este navegador, del más reciente al más antiguo. */
  listPublished(): Promise<string[]>
}

export const createPublicationService = (repository: PublishedPropertyRepository): PublicationService => ({
  publish: async (publication, operationKey) => {
    const published = await repository.getAll()
    // Reintentar un envío que ya se guardó no es otro anuncio: el repositorio devuelve el mismo.
    const isRetry = published.some((stored) => stored.operationKey === operationKey)

    if (!isRetry && hasReachedFreeLimit(published.length)) throw new PublicationLimitError()

    return repository.publish(publication, operationKey)
  },

  listPublished: async () => (await repository.getAll()).map((stored) => stored.id),
})

export const publicationService: PublicationService = createPublicationService(publishedPropertyRepository)
