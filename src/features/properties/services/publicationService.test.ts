import { describe, expect, it, vi } from 'vitest'
import { createPublicationService, publicationService } from '@/features/properties/services/publicationService'
import {
  createIndexedDbPublicationRepository,
  type PublishedPropertyRepository,
} from '@/features/properties/services/publishedPropertyRepository'
import { buildPublicationValues } from '@/test/factories'
import { toPublication } from '@/features/properties/utils/toPublication'
import { TEST_OPERATION_KEY } from '@/test/operationKey'

const PUBLICATION = toPublication(buildPublicationValues())

describe('createPublicationService', () => {
  it('entrega la publicación y la clave idempotente al repositorio y devuelve su identificador', async () => {
    // Arrange
    const repository: PublishedPropertyRepository = {
      publish: vi.fn(async () => 'casa-publicada'),
      getById: vi.fn(async () => undefined),
      getAll: vi.fn(async () => []),
    }
    const service = createPublicationService(repository)

    // Act
    const id = await service.publish(PUBLICATION, TEST_OPERATION_KEY)

    // Assert
    expect(repository.publish).toHaveBeenCalledExactlyOnceWith(PUBLICATION, TEST_OPERATION_KEY)
    expect(id).toBe('casa-publicada')
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
