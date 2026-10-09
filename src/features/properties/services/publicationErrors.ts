/** El plan de quien publica no admite más anuncios: este no se guardó, y reintentar no cambia el resultado. */
export class PublicationLimitError extends Error {
  constructor() {
    super('El plan ya no admite más publicaciones.')
    this.name = 'PublicationLimitError'
  }
}

/** Para publicar hace falta una cuenta: el anuncio queda a nombre de quien tiene la sesión abierta. */
export class PublicationSignInRequiredError extends Error {
  constructor() {
    super('Hay que iniciar sesión para publicar.')
    this.name = 'PublicationSignInRequiredError'
  }
}
