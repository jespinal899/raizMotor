import { describe, expect, it } from 'vitest'
import {
  PublicationUnavailableError,
  createPendingPublicationService,
  publicationService,
} from '@/features/properties/services/publicationService'
import { toPublication } from '@/features/properties/utils/toPublication'
import { buildPublicationValues } from '@/test/factories'
import { TEST_OPERATION_KEY } from '@/test/operationKey'

const PUBLICATION = toPublication(buildPublicationValues())

describe('createPendingPublicationService', () => {
  it('rechaza la publicación indicando que aún no está configurada, en lugar de fingirla', async () => {
    // Arrange
    const service = createPendingPublicationService()

    // Act
    const publishing = service.publish(PUBLICATION, TEST_OPERATION_KEY)

    // Assert
    await expect(publishing).rejects.toBeInstanceOf(PublicationUnavailableError)
  })
})

describe('PublicationUnavailableError', () => {
  it('es un Error con nombre propio, para distinguirlo de un fallo de red', () => {
    // Arrange: no necesita datos

    // Act
    const error = new PublicationUnavailableError()

    // Assert
    expect(error).toBeInstanceOf(Error)
    expect(error.name).toBe('PublicationUnavailableError')
  })
})

describe('publicationService', () => {
  it('mientras no exista el servicio de anuncios, la aplicación no publica ninguna propiedad', async () => {
    // Arrange
    const service = publicationService

    // Act
    const publishing = service.publish(PUBLICATION, TEST_OPERATION_KEY)

    // Assert
    await expect(publishing).rejects.toBeInstanceOf(PublicationUnavailableError)
  })
})
