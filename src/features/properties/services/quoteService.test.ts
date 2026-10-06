import { describe, expect, it } from 'vitest'
import {
  QuoteUnavailableError,
  createPendingQuoteService,
  quoteService,
} from '@/features/properties/services/quoteService'
import type { QuoteRequest } from '@/features/properties/types/quote.types'
import { TEST_OPERATION_KEY } from '@/test/operationKey'

const REQUEST: QuoteRequest = {
  propertyId: 'casa-1',
  fullName: 'Ana Mejía',
  email: 'ana@gmail.com',
  phone: '+50499999999',
}

describe('createPendingQuoteService', () => {
  it('rechaza la solicitud indicando que aún no está activa, en lugar de fingir que se envió', async () => {
    // Arrange
    const service = createPendingQuoteService()

    // Act
    const requesting = service.request(REQUEST, TEST_OPERATION_KEY)

    // Assert
    await expect(requesting).rejects.toBeInstanceOf(QuoteUnavailableError)
  })
})

describe('QuoteUnavailableError', () => {
  it('es un Error con nombre propio, para distinguirlo de un fallo de red', () => {
    // Arrange: no necesita datos

    // Act
    const error = new QuoteUnavailableError()

    // Assert
    expect(error).toBeInstanceOf(Error)
    expect(error.name).toBe('QuoteUnavailableError')
  })
})

describe('quoteService', () => {
  it('mientras no haya servidor, el servicio de la aplicación no entrega cotizaciones', async () => {
    // Arrange
    const service = quoteService

    // Act
    const requesting = service.request(REQUEST, TEST_OPERATION_KEY)

    // Assert
    await expect(requesting).rejects.toBeInstanceOf(QuoteUnavailableError)
  })
})
