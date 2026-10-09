import { useEffect, useState } from 'react'
import { authService } from '@/features/auth/services/authService'
import type { AuthService } from '@/features/auth/services/authService'
import type { SessionUser } from '@/features/auth/types/auth.types'

export type AuthState =
  | { status: 'loading' | 'signedOut'; user: null }
  | { status: 'signedIn'; user: SessionUser }

/**
 * Quién tiene la sesión abierta. Hasta que el servicio lo dice queda en `loading`: afirmar antes que no
 * hay nadie haría parpadear «Iniciar sesión» ante quien ya está dentro.
 */
export const useAuth = (service: AuthService = authService): AuthState => {
  const [user, setUser] = useState<SessionUser | null>()

  useEffect(() => service.onSessionChange(setUser), [service])

  if (user === undefined) return { status: 'loading', user: null }

  return user ? { status: 'signedIn', user } : { status: 'signedOut', user: null }
}
