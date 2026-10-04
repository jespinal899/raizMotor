import type { PropertyPublication } from '@/features/properties/types/publication.types'

/** La publicación de anuncios no está conectada todavía; no es un fallo de red ni de quien publica. */
export class PublicationUnavailableError extends Error {
  constructor() {
    super('La publicación de propiedades aún no está configurada.')
    this.name = 'PublicationUnavailableError'
  }
}

export interface PublicationService {
  /** Se resuelve cuando el anuncio queda publicado y se rechaza si no se pudo publicar. */
  publish(publication: PropertyPublication): Promise<void>
}

/** Implementación provisional mientras no exista el servicio de anuncios: nunca finge una publicación. */
export const createPendingPublicationService = (): PublicationService => ({
  publish: async () => {
    throw new PublicationUnavailableError()
  },
})

// Único punto donde se elige cómo se publica: al conectar el servicio de anuncios, se cambia solo esta línea.
export const publicationService: PublicationService = createPendingPublicationService()
