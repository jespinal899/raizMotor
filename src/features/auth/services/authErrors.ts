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

/** La cuenta existe, pero falta abrir el enlace de confirmación que se envió a su correo. */
export class EmailNotConfirmedError extends Error {
  constructor() {
    super('Falta confirmar el correo de la cuenta.')
    this.name = 'EmailNotConfirmedError'
  }
}

/** Ya hay una cuenta con ese correo. */
export class EmailTakenError extends Error {
  constructor() {
    super('Ya existe una cuenta con ese correo.')
    this.name = 'EmailTakenError'
  }
}

/** Las cuentas funcionan, pero entrar con Google todavía no está conectado. */
export class GoogleAccessUnavailableError extends Error {
  constructor() {
    super('El acceso con Google aún no está configurado.')
    this.name = 'GoogleAccessUnavailableError'
  }
}
