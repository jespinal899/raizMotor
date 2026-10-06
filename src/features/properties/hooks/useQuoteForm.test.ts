import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useQuoteForm } from '@/features/properties/hooks/useQuoteForm'
import { QuoteUnavailableError } from '@/features/properties/services/quoteService'
import type { QuoteApplicant } from '@/features/properties/types/quote.types'
import { deferred } from '@/test/deferred'
import { anyOperationKey } from '@/test/operationKey'

type Submit = (applicant: QuoteApplicant, operationKey: string) => Promise<void>

const setup = (onSubmit: Submit = vi.fn(async () => {})) => {
  const view = renderHook(() => useQuoteForm({ onSubmit }))
  return { onSubmit, ...view }
}

const fillValidForm = (result: ReturnType<typeof setup>['result']) => {
  act(() => result.current.change('fullName', 'Ana Mejía'))
  act(() => result.current.change('email', 'ana@gmail.com'))
  act(() => result.current.change('phone', '9999-9999'))
  act(() => result.current.change('acceptsTerms', true))
}

describe('useQuoteForm', () => {
  it('empieza vacío, sin aceptar los términos, sin errores y sin haber enviado', () => {
    // Arrange: formulario recién abierto

    // Act
    const { result } = setup()

    // Assert
    expect(result.current.values).toEqual({ fullName: '', email: '', phone: '', acceptsTerms: false })
    expect(result.current.errors).toEqual({})
    expect(result.current.status).toBe('idle')
  })

  it('no envía y muestra los errores si falta algún dato', async () => {
    // Arrange
    const { result, onSubmit } = setup()

    // Act
    await act(() => result.current.submit())

    // Assert
    expect(onSubmit).not.toHaveBeenCalled()
    expect(result.current.errors).toEqual({
      fullName: 'Escribe tu nombre y apellido.',
      email: 'Escribe tu correo.',
      phone: 'Escribe tu teléfono.',
      acceptsTerms: 'Acepta los términos y condiciones para cotizar.',
    })
    expect(result.current.status).toBe('idle')
  })

  it('no envía si no se aceptan los términos, aunque lo demás esté completo', async () => {
    // Arrange
    const { result, onSubmit } = setup()
    fillValidForm(result)
    act(() => result.current.change('acceptsTerms', false))

    // Act
    await act(() => result.current.submit())

    // Assert
    expect(onSubmit).not.toHaveBeenCalled()
    expect(result.current.errors.acceptsTerms).toBe('Acepta los términos y condiciones para cotizar.')
  })

  it('envía los datos sin espacios sobrantes y el teléfono completo, y queda como enviada', async () => {
    // Arrange
    const { result, onSubmit } = setup()
    fillValidForm(result)
    act(() => result.current.change('fullName', '  Ana   Mejía '))
    act(() => result.current.change('email', ' ana@gmail.com '))

    // Act
    await act(() => result.current.submit())

    // Assert
    expect(onSubmit).toHaveBeenCalledExactlyOnceWith(
      { fullName: 'Ana Mejía', email: 'ana@gmail.com', phone: '+50499999999' },
      anyOperationKey(),
    )
    expect(result.current.status).toBe('sent')
  })

  it('mientras el envío está en curso lo indica', async () => {
    // Arrange
    const sending = deferred()
    const { result } = setup(vi.fn(() => sending.promise))
    fillValidForm(result)

    // Act
    let submission = Promise.resolve()
    act(() => {
      submission = result.current.submit()
    })

    // Assert
    expect(result.current.status).toBe('sending')
    sending.finish()
    await act(() => submission)
  })

  it('cuando las cotizaciones aún no están activas lo distingue de un fallo', async () => {
    // Arrange
    const { result } = setup(vi.fn(() => Promise.reject(new QuoteUnavailableError())))
    fillValidForm(result)

    // Act
    await act(() => result.current.submit())

    // Assert
    expect(result.current.status).toBe('unavailable')
  })

  it('cualquier otro rechazo es un fallo del envío', async () => {
    // Arrange
    const { result } = setup(vi.fn(() => Promise.reject(new Error('sin conexión'))))
    fillValidForm(result)

    // Act
    await act(() => result.current.submit())

    // Assert
    expect(result.current.status).toBe('failed')
  })

  it('pedir la cotización dos veces seguidas la envía una sola vez', async () => {
    // Arrange
    const sending = deferred()
    const { result, onSubmit } = setup(vi.fn(() => sending.promise))
    fillValidForm(result)

    // Act
    let submissions: Promise<void>[] = []
    act(() => {
      submissions = [result.current.submit(), result.current.submit()]
    })
    sending.finish()
    await act(() => Promise.all(submissions).then(() => {}))

    // Assert
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('ya enviada, repetirla sin cambiar nada no vuelve a enviarla', async () => {
    // Arrange
    const { result, onSubmit } = setup()
    fillValidForm(result)
    await act(() => result.current.submit())

    // Act
    await act(() => result.current.submit())

    // Assert
    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(result.current.status).toBe('sent')
  })

  it('el reintento tras un fallo lleva la misma clave, para que el servicio no la duplique', async () => {
    // Arrange
    const onSubmit = vi.fn<Submit>().mockRejectedValueOnce(new Error('sin conexión')).mockResolvedValueOnce()
    const { result } = setup(onSubmit)
    fillValidForm(result)
    await act(() => result.current.submit())

    // Act
    await act(() => result.current.submit())

    // Assert
    const [firstKey, retryKey] = onSubmit.mock.calls.map(([, operationKey]) => operationKey)
    expect(retryKey).toBe(firstKey)
  })

  it('al cambiar un dato después de enviar, deja pedir otra cotización', async () => {
    // Arrange
    const { result, onSubmit } = setup()
    fillValidForm(result)
    await act(() => result.current.submit())
    act(() => result.current.change('phone', '8888-8888'))

    // Act
    await act(() => result.current.submit())

    // Assert
    expect(onSubmit).toHaveBeenCalledTimes(2)
    expect(onSubmit).toHaveBeenLastCalledWith(expect.objectContaining({ phone: '+50488888888' }), anyOperationKey())
  })
})
