import { vi } from 'vitest'
import type { AuthService } from '@/features/auth/services/authService'
import type { SessionUser } from '@/features/auth/types/auth.types'

type SessionListener = Parameters<AuthService['onSessionChange']>[0]

/**
 * Servicio de cuentas de mentira, para los hooks que lo reciben: todo sale bien y la prueba decide quién
 * tiene la sesión. Sin sesión inicial el servicio calla, como mientras carga la que hubiera guardada.
 */
export const fakeAuthService = (session?: SessionUser | null) => {
  const listeners = new Set<SessionListener>()

  const service = {
    login: vi.fn<AuthService['login']>(async () => {}),
    loginWithGoogle: vi.fn<AuthService['loginWithGoogle']>(async () => {}),
    register: vi.fn<AuthService['register']>(async () => 'confirmationPending'),
    requestPasswordReset: vi.fn<AuthService['requestPasswordReset']>(async () => {}),
    isRecoveringPassword: vi.fn<AuthService['isRecoveringPassword']>(() => false),
    changePassword: vi.fn<AuthService['changePassword']>(async () => {}),
    logout: vi.fn<AuthService['logout']>(async () => {}),
    onSessionChange: vi.fn<AuthService['onSessionChange']>((listener) => {
      listeners.add(listener)
      if (session !== undefined) listener(session)

      return () => {
        listeners.delete(listener)
      }
    }),
  }

  return {
    service,
    /** Cuántos siguen escuchando los cambios de sesión. */
    listenerCount: () => listeners.size,
    changeSession: (user: SessionUser | null) => listeners.forEach((listener) => listener(user)),
  }
}
