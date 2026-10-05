import type { LoginCredentials } from '@/features/auth/types/auth.types'

/** Las cuentas no están activas todavía; no es un fallo de red ni de quien intenta entrar. */
export class AuthUnavailableError extends Error {
  constructor() {
    super('El inicio de sesión aún no está configurado.')
    this.name = 'AuthUnavailableError'
  }
}

/** El correo o la contraseña no corresponden a ninguna cuenta. */
export class InvalidCredentialsError extends Error {
  constructor() {
    super('El correo o la contraseña no son correctos.')
    this.name = 'InvalidCredentialsError'
  }
}

export interface AuthService {
  /** Se resuelve cuando la sesión queda iniciada y se rechaza si no se pudo entrar. */
  login(credentials: LoginCredentials): Promise<void>
  /** Inicia sesión con la cuenta de Google de la persona; se resuelve y se rechaza igual que `login`. */
  loginWithGoogle(): Promise<void>
}

/** Implementación provisional mientras no exista el servicio de cuentas: nunca finge una sesión. */
export const createPendingAuthService = (): AuthService => {
  const rejectAsUnavailable = async () => {
    throw new AuthUnavailableError()
  }

  return { login: rejectAsUnavailable, loginWithGoogle: rejectAsUnavailable }
}

// Único punto donde se elige cómo se inicia sesión: al conectar el servicio de cuentas, se cambia solo esta línea.
export const authService: AuthService = createPendingAuthService()
