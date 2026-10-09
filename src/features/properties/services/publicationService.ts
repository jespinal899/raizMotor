import { propertyRepository } from '@/features/properties/services/propertyRepository'
import { PublicationLimitError } from '@/features/properties/services/publicationErrors'
import type {
  PublishedPropertyRepository,
  StoredPublication,
} from '@/features/properties/services/publishedPropertyRepository'
import type { PropertyPublication } from '@/features/properties/types/publication.types'
import { hasReachedLimit } from '@/features/properties/utils/publicationLimit'

export interface PublicationService {
  /**
   * Se resuelve con el identificador guardado. Repetir una clave devuelve ese mismo identificador.
   * Rechaza con `PublicationLimitError` si el anuncio es nuevo y el plan de quien publica no admite más.
   */
  publish(publication: PropertyPublication, operationKey: string): Promise<string>
  /** Identificadores de los anuncios de quien publica, del más reciente al más antiguo. */
  listPublished(): Promise<string[]>
  /** Cuántos anuncios admite a la vez el plan de quien publica. */
  getLimit(): Promise<number>
  /** Un anuncio propio tal como se publicó, para editarlo. Sin valor si no existe o es de otra persona. */
  getOwnPublication(id: string): Promise<StoredPublication | undefined>
  /** Guarda los cambios de un anuncio propio y se rechaza si no se pudo. Guardar otra vez los mismos lo deja igual. */
  update(id: string, publication: PropertyPublication, operationKey: string): Promise<void>
  /** Elimina un anuncio propio. Repetirlo no hace nada. */
  remove(id: string): Promise<void>
}

export const createPublicationService = (repository: PublishedPropertyRepository): PublicationService => ({
  publish: async (publication, operationKey) => {
    const [own, limit] = await Promise.all([repository.getOwn(), repository.getLimit()])
    // Reintentar un envío que ya se guardó no es otro anuncio: el repositorio devuelve el mismo.
    const isRetry = own.some((stored) => stored.operationKey === operationKey)

    // Se comprueba antes de enviar nada, para no subir las fotos de un anuncio que no se va a guardar.
    if (!isRetry && hasReachedLimit(own.length, limit)) throw new PublicationLimitError()

    return repository.publish(publication, operationKey)
  },

  listPublished: async () => (await repository.getOwn()).map((stored) => stored.id),

  getLimit: () => repository.getLimit(),

  getOwnPublication: async (id) => (await repository.getOwn()).find((stored) => stored.id === id)?.publication,

  update: (id, publication, operationKey) => repository.update(id, publication, operationKey),

  remove: (id) => repository.remove(id),
})

export const publicationService: PublicationService = createPublicationService(propertyRepository)
