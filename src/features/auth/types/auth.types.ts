export interface LoginCredentials {
  email: string
  password: string
  /** Mantener la sesión abierta en este dispositivo. */
  remember: boolean
}

export interface RegistrationCredentials {
  firstName: string
  lastName: string
  /** Con él se inicia sesión después. */
  email: string
  /** En el formulario, solo el número local; al enviarlo, completo y sin separadores: +50499999999. */
  phone: string
  password: string
}

/** Vía por la que se está intentando acceder: `submitting` con el formulario, `connecting` con Google. */
export type AccessInProgress = 'submitting' | 'connecting'

/**
 * Por qué no se pudo iniciar sesión: `unavailable` significa que las cuentas aún no están activas y
 * `rejected`, que el correo o la contraseña no son correctos.
 */
export type LoginFailure = 'unavailable' | 'rejected' | 'failed'

export type LoginStatus = 'idle' | AccessInProgress | LoginFailure

/** Por qué no se pudo crear la cuenta: `unavailable` significa que el registro aún no está activo. */
export type RegistrationFailure = 'unavailable' | 'failed'

export type RegistrationStatus = 'idle' | AccessInProgress | RegistrationFailure
