import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useLogout } from '@/features/auth/hooks/useLogout'
import { deferred } from '@/test/deferred'
import { fakeAuthService } from '@/test/fakeAuthService'

describe('useLogout', () => {
  it('cierra la sesión y no deja ningún aviso', async () => {
    // Arrange
    const { service } = fakeAuthService()
    const { result } = renderHook(() => useLogout(service))

    // Act
    await act(() => result.current.logout())

    // Assert
    expect(service.logout).toHaveBeenCalledOnce()
    expect(result.current.status).toBe('idle')
  })

  it('mientras se cierra lo indica', async () => {
    // Arrange
    const { promise, finish } = deferred()
    const { service } = fakeAuthService()
    service.logout.mockReturnValue(promise)
    const { result } = renderHook(() => useLogout(service))

    // Act
    let leaving: Promise<void> = Promise.resolve()
    act(() => {
      leaving = result.current.logout()
    })
    const statusWhileLeaving = result.current.status
    await act(async () => {
      finish()
      await leaving
    })

    // Assert
    expect(statusWhileLeaving).toBe('leaving')
  })

  it('si no se pudo cerrar queda como fallido, para avisar de que la sesión sigue abierta', async () => {
    // Arrange
    const { service } = fakeAuthService()
    service.logout.mockRejectedValue(new Error('sin conexión'))
    const { result } = renderHook(() => useLogout(service))

    // Act
    await act(() => result.current.logout())

    // Assert
    expect(result.current.status).toBe('failed')
  })
})
