import { describe, expect, it, vi } from 'vitest'
import { PublicationLimitError } from '@/features/properties/services/publicationErrors'
import { createPublicationService, publicationService } from '@/features/properties/services/publicationService'
import {
  createIndexedDbPublicationRepository,
  type PublishedPropertyRepository,
  type StoredPropertyPublication,
} from '@/features/properties/services/publishedPropertyRepository'
import { toPublication } from '@/features/properties/utils/toPublication'
import { buildPublicationValues } from '@/test/factories'
import { TEST_OPERATION_KEY } from '@/test/operationKey'

const PUBLICATION = toPublication(buildPublicationValues())

const stored = (id: string, operationKey: string, createdAt = 1): StoredPropertyPublication => ({
  id,
  operationKey,
  createdAt,
  publication: PUBLICATION,
})

/** Repositorio falso con los anuncios que ya tiene quien publica y los que su plan le admite. */
const repositoryWith = (records: StoredPropertyPublication[] = [], limit = 1): PublishedPropertyRepository => ({
  publish: vi.fn(async () => 'casa-publicada'),
  getById: vi.fn(async () => undefined),
  getAll: vi.fn(async () => []),
  getOwn: vi.fn(async () => records),
  getLimit: vi.fn(async () => limit),
  update: vi.fn(async () => {}),
  remove: vi.fn(async () => {}),
})

describe('createPublicationService', () => {
  it('entrega la publicación y la clave idempotente al repositorio y devuelve su identificador', async () => {
    // Arrange
    const repository = repositoryWith()
    const service = createPublicationService(repository)

    // Act
    const id = await service.publish(PUBLICATION, TEST_OPERATION_KEY)

    // Assert
    expect(repository.publish).toHaveBeenCalledExactlyOnceWith(PUBLICATION, TEST_OPERATION_KEY)
    expect(id).toBe('casa-publicada')
  })

  it('rechaza una segunda publicación: el plan gratuito ya se usó', async () => {
    // Arrange
    const repository = repositoryWith([stored('la-primera', 'otra-clave')])
    const service = createPublicationService(repository)

    // Act
    const publishing = service.publish(PUBLICATION, TEST_OPERATION_KEY)

    // Assert
    await expect(publishing).rejects.toBeInstanceOf(PublicationLimitError)
    expect(repository.publish).not.toHaveBeenCalled()
  })

  it('con un plan que admite más anuncios, publica mientras no llegue a su límite', async () => {
    // Arrange
    const repository = repositoryWith([stored('la-primera', 'clave-1'), stored('la-segunda', 'clave-2')], 3)
    const service = createPublicationService(repository)

    // Act
    const id = await service.publish(PUBLICATION, TEST_OPERATION_KEY)

    // Assert
    expect(id).toBe('casa-publicada')
  })

  it('dice cuántos anuncios admite el plan de quien publica', async () => {
    // Arrange
    const service = createPublicationService(repositoryWith([], 25))

    // Act
    const limit = await service.getLimit()

    // Assert
    expect(limit).toBe(25)
  })

  it('guarda los cambios de un anuncio con la clave de la operación', async () => {
    // Arrange
    const repository = repositoryWith([stored('la-primera', 'clave-1')])
    const service = createPublicationService(repository)

    // Act
    await service.update('la-primera', PUBLICATION, TEST_OPERATION_KEY)

    // Assert
    expect(repository.update).toHaveBeenCalledExactlyOnceWith('la-primera', PUBLICATION, TEST_OPERATION_KEY)
  })

  it('entrega un anuncio propio tal como se publicó, para poder editarlo', async () => {
    // Arrange
    const service = createPublicationService(repositoryWith([stored('la-primera', 'clave-1')]))

    // Act
    const publication = await service.getOwnPublication('la-primera')

    // Assert
    expect(publication).toEqual(PUBLICATION)
  })

  it('de un anuncio que no es de quien lo pide no entrega nada', async () => {
    // Arrange
    const service = createPublicationService(repositoryWith([stored('la-primera', 'clave-1')]))

    // Act
    const publication = await service.getOwnPublication('el-de-otra-cuenta')

    // Assert
    expect(publication).toBeUndefined()
  })

  it('elimina un anuncio propio', async () => {
    // Arrange
    const repository = repositoryWith([stored('la-primera', 'clave-1')])
    const service = createPublicationService(repository)

    // Act
    await service.remove('la-primera')

    // Assert
    expect(repository.remove).toHaveBeenCalledExactlyOnceWith('la-primera')
  })

  it('repetir el mismo envío no cuenta como otra publicación: devuelve el anuncio que ya se guardó', async () => {
    // Arrange
    const repository = repositoryWith([stored('casa-publicada', TEST_OPERATION_KEY)])
    const service = createPublicationService(repository)

    // Act
    const id = await service.publish(PUBLICATION, TEST_OPERATION_KEY)

    // Assert
    expect(id).toBe('casa-publicada')
    expect(repository.publish).toHaveBeenCalledExactlyOnceWith(PUBLICATION, TEST_OPERATION_KEY)
  })

  it('lista los anuncios ya publicados desde este navegador, en el orden del repositorio: el más reciente primero', async () => {
    // Arrange
    const repository = repositoryWith([stored('reciente', 'clave-2', 300), stored('antiguo', 'clave-1', 100)])
    const service = createPublicationService(repository)

    // Act
    const published = await service.listPublished()

    // Assert
    expect(published).toEqual(['reciente', 'antiguo'])
  })

  it('sin anuncios guardados, la lista está vacía', async () => {
    // Arrange
    const service = createPublicationService(repositoryWith())

    // Act
    const published = await service.listPublished()

    // Assert
    expect(published).toEqual([])
  })

  it('rechaza el guardado si el navegador no tiene IndexedDB', async () => {
    // Arrange
    const repository = createIndexedDbPublicationRepository({ getFactory: () => undefined })
    const service = createPublicationService(repository)

    // Act
    const publishing = service.publish(PUBLICATION, TEST_OPERATION_KEY)

    // Assert
    await expect(publishing).rejects.toThrow('Este navegador no permite guardar publicaciones.')
  })
})

describe('PublicationLimitError', () => {
  it('es un Error con nombre propio, para distinguirlo de un fallo del almacenamiento', () => {
    // Arrange: no necesita datos

    // Act
    const error = new PublicationLimitError()

    // Assert
    expect(error).toBeInstanceOf(Error)
    expect(error.name).toBe('PublicationLimitError')
  })
})

describe('publicationService', () => {
  it('rechaza en jsdom, que no tiene IndexedDB, en lugar de fingir que publicó', async () => {
    // Arrange
    const service = publicationService

    // Act
    const publishing = service.publish(PUBLICATION, TEST_OPERATION_KEY)

    // Assert
    await expect(publishing).rejects.toThrow('Este navegador no permite guardar publicaciones.')
  })
})
