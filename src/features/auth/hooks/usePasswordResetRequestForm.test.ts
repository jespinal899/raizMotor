import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { usePasswordResetRequestForm } from '@/features/auth/hooks/usePasswordResetRequestForm'
import { CaptchaFailedError } from '@/features/auth/services/authErrors'
import { deferred } from '@/test/deferred'

type Submit = (email: string) => Promise<void>

const setup = (onSubmit: Submit = vi.fn<Submit>(async () => {})) => {
  const view = renderHook(() => usePasswordResetRequestForm({ onSubmit }))

  return { onSubmit, ...view }
}

describe('usePasswordResetRequestForm', () => {
  it('empieza con el correo vacío, sin errores y sin resultado', () => {
    // Arrange: formulario recién abierto

    // Act
    const { result } = setup()

    // Assert
    expect(result.current.values).toEqual({ email: '' })
    expect(result.current.errors).toEqual({})
    expect(result.current.status).toBe('idle')
  })

  it.each([
    { email: '', error: 'Escribe tu correo.', when: 'falta el correo' },
    { email: 'ana@', error: 'Revisa el correo: debe tener el formato nombre@dominio.com.', when: 'no tiene forma de correo' },
  ])('no pide el enlace y lo explica cuando $when', async ({ email, error }) => {
    // Arrange
    const { result, onSubmit } = setup()
    act(() => result.current.change('email', email))

    // Act
    await act(() => result.current.submit())

    // Assert
    expect(onSubmit).not.toHaveBeenCalled()
    expect(result.current.errors.email).toBe(error)
    expect(result.current.status).toBe('idle')
  })

  it('pide el enlace para el correo escrito, sin espacios sobrantes', async () => {
    // Arrange
    const { result, onSubmit } = setup()
    act(() => result.current.change('email', '  ana@gmail.com '))

    // Act
    await act(() => result.current.submit())

    // Assert
    expect(onSubmit).toHaveBeenCalledExactlyOnceWith('ana@gmail.com')
  })

  it('mientras se pide lo indica, y al terminar queda como enviado', async () => {
    // Arrange
    const { promise, finish } = deferred()
    const { result } = setup(() => promise)
    act(() => result.current.change('email', 'ana@gmail.com'))

    // Act
    let request: Promise<void> = Promise.resolve()
    act(() => {
      request = result.current.submit()
    })
    const statusWhileSubmitting = result.current.status
    await act(async () => {
      finish()
      await request
    })

    // Assert
    expect(statusWhileSubmitting).toBe('submitting')
    expect(result.current.status).toBe('sent')
  })

  it('queda como fallido si el enlace no se pudo enviar', async () => {
    // Arrange
    const { result } = setup(() => Promise.reject(new Error('sin conexión')))
    act(() => result.current.change('email', 'ana@gmail.com'))

    // Act
    await act(() => result.current.submit())

    // Assert
    expect(result.current.status).toBe('failed')
  })

  it('si falta la verificación contra bots, lo distingue de un fallo', async () => {
    // Arrange
    const { result } = setup(() => Promise.reject(new CaptchaFailedError()))
    act(() => result.current.change('email', 'ana@gmail.com'))

    // Act
    await act(() => result.current.submit())

    // Assert
    expect(result.current.status).toBe('captcha')
  })

  it('pedirlo dos veces seguidas, con el primer envío aún en curso, lo pide una sola vez', async () => {
    // Arrange
    const { promise, finish } = deferred()
    const onSubmit = vi.fn<Submit>(() => promise)
    const { result } = setup(onSubmit)
    act(() => result.current.change('email', 'ana@gmail.com'))

    // Act
    let first: Promise<void> = Promise.resolve()
    let second: Promise<void> = Promise.resolve()
    act(() => {
      first = result.current.submit()
      second = result.current.submit()
    })
    await act(async () => {
      finish()
      await Promise.all([first, second])
    })

    // Assert
    expect(onSubmit).toHaveBeenCalledOnce()
  })
})
