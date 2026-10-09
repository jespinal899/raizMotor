import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useNewPasswordForm } from '@/features/auth/hooks/useNewPasswordForm'
import { RecoveryLinkExpiredError, SamePasswordError } from '@/features/auth/services/authErrors'
import { MIN_PASSWORD_LENGTH } from '@/features/auth/utils/credentialRules'
import { anyOperationKey } from '@/test/operationKey'

type Submit = (password: string, operationKey: string) => Promise<void>

const setup = (onSubmit: Submit = vi.fn<Submit>(async () => {})) => {
  const view = renderHook(() => useNewPasswordForm({ onSubmit }))

  return { onSubmit, ...view }
}

const write = (result: ReturnType<typeof setup>['result'], password = 'otra-secreta-456') => {
  act(() => result.current.change('password', password))
}

describe('useNewPasswordForm', () => {
  it('empieza vacío, sin errores y sin resultado', () => {
    // Arrange: formulario recién abierto

    // Act
    const { result } = setup()

    // Assert
    expect(result.current.values).toEqual({ password: '' })
    expect(result.current.errors).toEqual({})
    expect(result.current.status).toBe('idle')
  })

  it('no guarda una contraseña más corta de lo exigido, y dice cuántos caracteres hacen falta', async () => {
    // Arrange
    const { result, onSubmit } = setup()
    write(result, 'a'.repeat(MIN_PASSWORD_LENGTH - 1))

    // Act
    await act(() => result.current.submit())

    // Assert
    expect(onSubmit).not.toHaveBeenCalled()
    expect(result.current.errors.password).toBe(`Usa al menos ${MIN_PASSWORD_LENGTH} caracteres.`)
  })

  it('guarda la contraseña tal como se escribió, con sus espacios, junto a la clave de la operación', async () => {
    // Arrange
    const { result, onSubmit } = setup()
    write(result, ' otra secreta 456 ')

    // Act
    await act(() => result.current.submit())

    // Assert
    expect(onSubmit).toHaveBeenCalledExactlyOnceWith(' otra secreta 456 ', anyOperationKey())
  })

  it('al guardarla queda como cambiada', async () => {
    // Arrange
    const { result } = setup()
    write(result)

    // Act
    await act(() => result.current.submit())

    // Assert
    expect(result.current.status).toBe('changed')
  })

  it.each([
    { reason: new SamePasswordError(), status: 'unchanged', when: 'es la misma contraseña de antes' },
    { reason: new RecoveryLinkExpiredError(), status: 'expired', when: 'el enlace ya no vale' },
    { reason: new Error('sin conexión'), status: 'failed', when: 'ocurre cualquier otro error' },
  ])('queda como "$status" cuando $when', async ({ reason, status }) => {
    // Arrange
    const { result } = setup(() => Promise.reject(reason))
    write(result)

    // Act
    await act(() => result.current.submit())

    // Assert
    expect(result.current.status).toBe(status)
  })

  it('reintentar tras un fallo lleva la misma clave, para que el servicio reconozca el reintento', async () => {
    // Arrange
    const onSubmit = vi.fn<Submit>(() => Promise.reject(new Error('sin conexión')))
    const { result } = setup(onSubmit)
    write(result)
    await act(() => result.current.submit())

    // Act
    await act(() => result.current.submit())

    // Assert
    const [[, first], [, second]] = onSubmit.mock.calls
    expect(second).toBe(first)
  })
})
