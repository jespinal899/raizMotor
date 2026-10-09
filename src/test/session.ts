import { vi } from 'vitest'
import { authService } from '@/features/auth/services/authService'
import type { SessionUser } from '@/features/auth/types/auth.types'

/**
 * Para las pruebas de componentes que simulan el módulo del servicio de cuentas: deja dicho quién tiene
 * la sesión abierta. Si no se llama, el servicio simulado calla, como mientras carga la sesión guardada.
 */
export const sessionIs = (user: SessionUser | null) => {
  vi.mocked(authService.onSessionChange).mockImplementation((listener) => {
    listener(user)

    return () => {}
  })
}
