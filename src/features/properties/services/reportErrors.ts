/** Los reportes no están conectados todavía; no es un fallo de red ni de quien reporta. */
export class ReportUnavailableError extends Error {
  constructor() {
    super('El envío de reportes aún no está configurado.')
    this.name = 'ReportUnavailableError'
  }
}

/** Llegaron demasiados reportes en la última hora, de esta cuenta o sobre este anuncio: hay que esperar. */
export class ReportThrottledError extends Error {
  constructor() {
    super('Se enviaron demasiados reportes en poco tiempo.')
    this.name = 'ReportThrottledError'
  }
}
