/** El contacto con el publicador no está conectado; no es un fallo de red ni de quien escribe. */
export class QuoteUnavailableError extends Error {
  constructor() {
    super('El envío de cotizaciones aún no está configurado.')
    this.name = 'QuoteUnavailableError'
  }
}

/** Llegaron demasiados contactos en la última hora, desde esta conexión o sobre este anuncio: hay que esperar. */
export class QuoteThrottledError extends Error {
  constructor() {
    super('Se enviaron demasiados contactos en poco tiempo.')
    this.name = 'QuoteThrottledError'
  }
}

/** Falta la verificación contra bots, o el servidor la rechazó. */
export class QuoteCaptchaError extends Error {
  constructor() {
    super('No se completó la verificación de seguridad.')
    this.name = 'QuoteCaptchaError'
  }
}
