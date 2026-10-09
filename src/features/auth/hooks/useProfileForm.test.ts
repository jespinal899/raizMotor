import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useProfileForm } from '@/features/auth/hooks/useProfileForm'
import type { AccountProfile } from '@/features/auth/types/auth.types'
import { buildSessionUser } from '@/test/factories'

type Submit = (profile: AccountProfile) => Promise<void>

const USER = buildSessionUser({ firstName: 'Ana', lastName: 'Mejía', phone: '+50499999999' })

const setup = (onSubmit: Submit = vi.fn<Submit>(async () => {})) => {
  const view = renderHook(() => useProfileForm({ user: USER, onSubmit }))

  return { onSubmit, ...view }
}

describe('useProfileForm', () => {
  it('empieza con los datos de la cuenta, y el teléfono como se escribe: sin el prefijo del país', () => {
    // Arrange: cuenta con sus datos guardados

    // Act
    const { result } = setup()

    // Assert
    expect(result.current.values).toEqual({ firstName: 'Ana', lastName: 'Mejía', phone: '9999-9999' })
    expect(result.current.status).toBe('idle')
  })

  it('guarda los datos sin espacios sobrantes y el teléfono completo, con su prefijo', async () => {
    // Arrange
    const { result, onSubmit } = setup()
    act(() => result.current.change('firstName', '  Ana María '))
    act(() => result.current.change('phone', '8888-0000'))

    // Act
    await act(() => result.current.submit())

    // Assert
    expect(onSubmit).toHaveBeenCalledExactlyOnceWith({ firstName: 'Ana María', lastName: 'Mejía', phone: '+50488880000' })
    expect(result.current.status).toBe('saved')
  })

  it('no guarda y lo explica si falta el nombre o el teléfono no es válido', async () => {
    // Arrange
    const { result, onSubmit } = setup()
    act(() => result.current.change('firstName', ''))
    act(() => result.current.change('phone', '1234'))

    // Act
    await act(() => result.current.submit())

    // Assert
    expect(onSubmit).not.toHaveBeenCalled()
    expect(result.current.errors).toMatchObject({
      firstName: 'Escribe tu nombre.',
      phone: 'Escribe los 8 dígitos de tu número.',
    })
  })

  it('queda como fallido si no se pudieron guardar', async () => {
    // Arrange
    const { result } = setup(() => Promise.reject(new Error('sin conexión')))

    // Act
    await act(() => result.current.submit())

    // Assert
    expect(result.current.status).toBe('failed')
  })

  it('al corregir algo después de guardar retira el aviso: lo nuevo aún no está guardado', async () => {
    // Arrange
    const { result } = setup()
    await act(() => result.current.submit())

    // Act
    act(() => result.current.change('lastName', 'Mejía Paz'))

    // Assert
    expect(result.current.status).toBe('idle')
  })
})
