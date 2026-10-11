import { describe, expect, it, vi } from 'vitest'
import { createPublisherContactService } from '@/features/properties/services/publisherContactService'
import type { InvokeContactPublisher } from '@/features/properties/services/publisherContactService'
import {
  QuoteCaptchaError,
  QuoteThrottledError,
  QuoteUnavailableError,
} from '@/features/properties/services/quoteErrors'

const PROPERTY_ID = '3f0c2a54-6f0e-4a35-9b6f-0d6f1f6c2a11'
const REQUEST = { propertyId: PROPERTY_ID, fullName: 'Ana Mejía', email: 'ana@gmail.com', phone: '+50499999999' }

/** Un fallo como los de Supabase al llamar a una función: la respuesta va en `context`. */
const httpError = (status: number) => ({ name: 'FunctionsHttpError', context: { status } })

const setup = ({
  error = null as unknown,
  token = null as string | null,
  captchaRequired = false,
} = {}) => {
  const invoke = vi.fn<InvokeContactPublisher>(async () => ({ error }))
  const service = createPublisherContactService({ invoke, takeCaptchaToken: async () => token, captchaRequired })

  return { invoke, service }
}

describe('createPublisherContactService', () => {
  it('manda a la función los datos, la propiedad y la clave del envío', async () => {
    // Arrange
    const { service, invoke } = setup()

    // Act
    await service.request(REQUEST, 'clave-del-envio')

    // Assert
    expect(invoke).toHaveBeenCalledExactlyOnceWith({ ...REQUEST, operationKey: 'clave-del-envio' })
  })

  it('con la verificación contra bots, envía también su token', async () => {
    // Arrange
    const { service, invoke } = setup({ token: 'token-1', captchaRequired: true })

    // Act
    await service.request(REQUEST, 'clave')

    // Assert
    expect(invoke).toHaveBeenCalledWith(expect.objectContaining({ captchaToken: 'token-1' }))
  })

  it('si el sitio exige la verificación y no hay token, rechaza sin llamar a la función', async () => {
    // Arrange
    const { service, invoke } = setup({ captchaRequired: true })

    // Act
    const sent = service.request(REQUEST, 'clave')

    // Assert
    await expect(sent).rejects.toBeInstanceOf(QuoteCaptchaError)
    expect(invoke).not.toHaveBeenCalled()
  })

  it.each([
    [429, QuoteThrottledError],
    [403, QuoteCaptchaError],
  ])('si la función responde %i, rechaza con %o', async (status, ExpectedError) => {
    // Arrange
    const { service } = setup({ error: httpError(status) })

    // Act
    const sent = service.request(REQUEST, 'clave')

    // Assert
    await expect(sent).rejects.toBeInstanceOf(ExpectedError)
  })

  it('cualquier otro fallo se entrega tal cual, sin dar los datos por enviados', async () => {
    // Arrange
    const failure = httpError(502)
    const { service } = setup({ error: failure })

    // Act
    const sent = service.request(REQUEST, 'clave')

    // Assert
    await expect(sent).rejects.toBe(failure)
  })

  it('una propiedad de ejemplo no tiene a quién escribirle: no llama a la función', async () => {
    // Arrange
    const { service, invoke } = setup()

    // Act
    const sent = service.request({ ...REQUEST, propertyId: 'casa-lomas-del-guijarro' }, 'clave')

    // Assert
    await expect(sent).rejects.toBeInstanceOf(QuoteUnavailableError)
    expect(invoke).not.toHaveBeenCalled()
  })
})
