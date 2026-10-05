export interface LoginCredentials {
  email: string
  password: string
  /** Mantener la sesión abierta en este dispositivo. */
  remember: boolean
}

/** Vía por la que se está intentando acceder: `submitting` con el formulario, `connecting` con Google. */
export type AccessInProgress = 'submitting' | 'connecting'

/**
 * Por qué no se pudo iniciar sesión: `unavailable` significa que las cuentas aún no están activas y
 * `rejected`, que el correo o la contraseña no son correctos.
 */
export type LoginFailure = 'unavailable' | 'rejected' | 'failed'

export type LoginStatus = 'idle' | AccessInProgress | LoginFailure
