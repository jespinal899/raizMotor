export interface LoginCredentials {
  email: string
  password: string
  /** Mantener la sesión abierta en este dispositivo. */
  remember: boolean
}

/**
 * Estado de un intento de inicio de sesión. Mientras está en curso: `submitting` con correo y
 * contraseña, `connecting` con Google. Si no se pudo entrar: `unavailable` significa que las cuentas
 * aún no están activas y `rejected`, que el correo o la contraseña no son correctos.
 */
export type LoginStatus = 'idle' | 'submitting' | 'connecting' | 'unavailable' | 'rejected' | 'failed'
