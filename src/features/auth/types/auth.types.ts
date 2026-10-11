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

/** Los datos con que una cuenta se presenta en el sitio y en sus anuncios. */
export type AccountProfile = Pick<RegistrationCredentials, 'firstName' | 'lastName' | 'phone'>

/** Quién tiene la sesión abierta. El nombre, el apellido y el teléfono van vacíos si la cuenta no los guarda. */
export interface SessionUser extends AccountProfile {
  email: string
}

/** Estado del formulario de los datos de la cuenta: `saved` cuando ya se guardaron. */
export type ProfileStatus = 'idle' | 'submitting' | 'saved' | 'failed'

/** Cómo queda quien acaba de registrarse: ya dentro, o a la espera de abrir el enlace enviado a su correo. */
export type RegistrationOutcome = 'signedIn' | 'confirmationPending'

/** Vía por la que se está intentando acceder: `submitting` con el formulario, `connecting` con Google. */
export type AccessInProgress = 'submitting' | 'connecting'

/**
 * Por qué no se pudo iniciar sesión: `unavailable` significa que las cuentas aún no están activas;
 * `rejected`, que el correo o la contraseña no son correctos; `unconfirmed`, que falta confirmar el correo,
 * y `googleUnavailable`, que las cuentas funcionan pero el acceso con Google todavía no.
 */
export type LoginFailure = 'unavailable' | 'rejected' | 'unconfirmed' | 'googleUnavailable' | 'captcha' | 'failed'

export type LoginStatus = 'idle' | AccessInProgress | LoginFailure

/**
 * Por qué no se pudo crear la cuenta: `unavailable` significa que el registro aún no está activo;
 * `taken`, que ese correo ya tiene cuenta, y `googleUnavailable`, que el registro con Google todavía no funciona.
 */
export type RegistrationFailure = 'unavailable' | 'taken' | 'googleUnavailable' | 'captcha' | 'failed'

export type RegistrationStatus = 'idle' | AccessInProgress | RegistrationFailure

/** Estado del formulario que pide el enlace para elegir otra contraseña: `sent` cuando ya se pidió. */
export type PasswordResetRequestStatus = 'idle' | 'submitting' | 'sent' | 'captcha' | 'failed'

/**
 * Por qué no se guardó la contraseña nueva: `unchanged` significa que es la misma de antes y `expired`,
 * que el enlace con el que se llegó ya no vale.
 */
export type PasswordChangeFailure = 'unchanged' | 'expired' | 'failed'

export type PasswordChangeStatus = 'idle' | 'submitting' | 'changed' | PasswordChangeFailure
