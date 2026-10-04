export interface LoginCredentials {
  email: string
  password: string
  /** Mantener la sesión abierta en este dispositivo. */
  remember: boolean
}

/**
 * Resultado de un intento de inicio de sesión: `unavailable` significa que las cuentas aún no
 * están activas y `rejected`, que el correo o la contraseña no son correctos.
 */
export type LoginStatus = 'idle' | 'submitting' | 'unavailable' | 'rejected' | 'failed'
