import { authService } from '@/features/auth/services/authService'
import type { AuthService } from '@/features/auth/services/authService'
import { useAttempt } from '@/hooks/useAttempt'

/** Cerrar sesión puede tardar y fallar: si falla, la persona sigue dentro y hay que decírselo. */
export const useLogout = (service: AuthService = authService) => {
  const { status, attempt } = useAttempt<'leaving', 'failed'>({ toFailure: () => 'failed' })

  return { status, logout: () => attempt('leaving', () => service.logout()) }
}
