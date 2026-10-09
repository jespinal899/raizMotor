import { propertyRepository } from '@/features/properties/services/propertyRepository'
import { PublicationLimitError } from '@/features/properties/services/publicationErrors'
import type {
  PublishedPropertyRepository,
  StoredPropertyPublication,
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
  /**
   * Identificadores de los anuncios de quien publica que están en el catálogo, del más reciente al más
   * antiguo. Son los que ocupan su plan: los despublicados no cuentan.
   */
  listPublished(): Promise<string[]>
  /** Cuántos anuncios publicados admite a la vez el plan de quien publica. */
  getLimit(): Promise<number>
  /** Un anuncio propio tal como se publicó, para editarlo. Sin valor si no existe o es de otra persona. */
  getOwnPublication(id: string): Promise<StoredPublication | undefined>
  /** Guarda los cambios de un anuncio propio y se rechaza si no se pudo. Guardar otra vez los mismos lo deja igual. */
  update(id: string, publication: PropertyPublication, operationKey: string): Promise<void>
  /** Retira del catálogo un anuncio propio, que se conserva. Repetirlo lo deja igual. */
  unpublish(id: string): Promise<void>
  /**
   * Devuelve al catálogo un anuncio propio despublicado. Repetirlo lo deja igual. Rechaza con
   * `PublicationLimitError` si el plan de quien publica no admite otro anuncio publicado.
   */
  republish(id: string): Promise<void>
  /** Elimina un anuncio propio. Repetirlo no hace nada. */
  remove(id: string): Promise<void>
}

const isInCatalog = (stored: StoredPropertyPublication) => !stored.withdrawn

export const createPublicationService = (repository: PublishedPropertyRepository): PublicationService => ({
  publish: async (publication, operationKey) => {
    const [own, limit] = await Promise.all([repository.getOwn(), repository.getLimit()])
    // Reintentar un envío que ya se guardó no es otro anuncio: el repositorio devuelve el mismo.
    const isRetry = own.some((stored) => stored.operationKey === operationKey)

    // Se comprueba antes de enviar nada, para no subir las fotos de un anuncio que no se va a guardar.
    if (!isRetry && hasReachedLimit(own.filter(isInCatalog).length, limit)) throw new PublicationLimitError()

    return repository.publish(publication, operationKey)
  },

  listPublished: async () => (await repository.getOwn()).filter(isInCatalog).map((stored) => stored.id),

  getLimit: () => repository.getLimit(),

  getOwnPublication: async (id) => (await repository.getOwn()).find((stored) => stored.id === id)?.publication,

  update: (id, publication, operationKey) => repository.update(id, publication, operationKey),

  unpublish: (id) => repository.unpublish(id),

  republish: async (id) => {
    const [own, limit] = await Promise.all([repository.getOwn(), repository.getLimit()])
    // El propio anuncio no se cuenta: si ya estuviera publicado, repetirlo no debe chocar con el límite.
    const others = own.filter((stored) => stored.id !== id && isInCatalog(stored))

    if (hasReachedLimit(others.length, limit)) throw new PublicationLimitError()

    return repository.republish(id)
  },

  remove: (id) => repository.remove(id),
})

export const publicationService: PublicationService = createPublicationService(propertyRepository)
