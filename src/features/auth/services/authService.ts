import type { LoginCredentials, RegistrationCredentials } from '@/features/auth/types/auth.types'

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

/** El registro aún no está conectado al servicio de cuentas. */
export class RegistrationUnavailableError extends Error {
  constructor() {
    super('El registro aún no está configurado.')
    this.name = 'RegistrationUnavailableError'
  }
}

export interface AuthService {
  /** Se resuelve cuando la sesión queda iniciada y se rechaza si no se pudo entrar. Repetirlo deja la misma sesión. */
  login(credentials: LoginCredentials): Promise<void>
  /** Inicia sesión con la cuenta de Google de la persona; se resuelve y se rechaza igual que `login`. */
  loginWithGoogle(): Promise<void>
  /**
   * Se resuelve cuando la cuenta queda creada y se rechaza si no se pudo registrar. Es idempotente: si
   * llega dos veces con la misma clave, por un reintento o un doble envío, se crea una sola cuenta.
   */
  register(credentials: RegistrationCredentials, operationKey: string): Promise<void>
}

/** Implementación provisional mientras no exista el servicio de cuentas: nunca finge una sesión o un registro. */
export const createPendingAuthService = (): AuthService => {
  const rejectLoginAsUnavailable = async () => {
    throw new AuthUnavailableError()
  }
  const rejectRegistrationAsUnavailable = async () => {
    throw new RegistrationUnavailableError()
  }

  return {
    login: rejectLoginAsUnavailable,
    loginWithGoogle: rejectLoginAsUnavailable,
    register: rejectRegistrationAsUnavailable,
  }
}

// Único punto donde se elige cómo se gestionan las cuentas: al conectar el servicio, se cambia esta implementación.
export const authService: AuthService = createPendingAuthService()
