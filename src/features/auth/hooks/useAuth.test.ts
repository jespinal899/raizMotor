import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { buildSessionUser } from '@/test/factories'
import { fakeAuthService } from '@/test/fakeAuthService'

const USER = buildSessionUser()

describe('useAuth', () => {
  it('mientras el servicio no dice quién tiene la sesión, no afirma que no haya nadie', () => {
    // Arrange
    const { service } = fakeAuthService()

    // Act
    const { result } = renderHook(() => useAuth(service))

    // Assert
    expect(result.current).toEqual({ status: 'loading', user: null })
  })

  it('entrega a quien tiene la sesión abierta', () => {
    // Arrange
    const { service } = fakeAuthService(USER)

    // Act
    const { result } = renderHook(() => useAuth(service))

    // Assert
    expect(result.current).toEqual({ status: 'signedIn', user: USER })
  })

  it('dice que no hay sesión cuando nadie entró', () => {
    // Arrange
    const { service } = fakeAuthService(null)

    // Act
    const { result } = renderHook(() => useAuth(service))

    // Assert
    expect(result.current).toEqual({ status: 'signedOut', user: null })
  })

  it('se entera cuando la sesión se cierra', () => {
    // Arrange
    const { service, changeSession } = fakeAuthService(USER)
    const { result } = renderHook(() => useAuth(service))

    // Act
    act(() => changeSession(null))

    // Assert
    expect(result.current).toEqual({ status: 'signedOut', user: null })
  })

  it('al salir de la pantalla deja de escuchar al servicio', () => {
    // Arrange
    const { service, listenerCount } = fakeAuthService(USER)
    const { unmount } = renderHook(() => useAuth(service))

    // Act
    unmount()

    // Assert
    expect(listenerCount()).toBe(0)
  })
})
