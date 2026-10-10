/** El plan de quien publica no admite más anuncios: este no se guardó, y reintentar no cambia el resultado. */
export class PublicationLimitError extends Error {
  constructor() {
    super('El plan ya no admite más publicaciones.')
    this.name = 'PublicationLimitError'
  }
}

/**
 * Se alcanzó un límite de uso: demasiados cambios o demasiadas fotos en poco tiempo. No se guardó nada, y
 * reintentar enseguida no cambia el resultado: el límite se renueva solo, en una o dos horas.
 */
export class RateLimitedError extends Error {
  constructor() {
    super('Se alcanzó el límite de cambios por ahora.')
    this.name = 'RateLimitedError'
  }
}

/** Para publicar hace falta una cuenta: el anuncio queda a nombre de quien tiene la sesión abierta. */
export class PublicationSignInRequiredError extends Error {
  constructor() {
    super('Hay que iniciar sesión para publicar.')
    this.name = 'PublicationSignInRequiredError'
  }
}
