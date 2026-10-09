/**
 * Publicaciones que incluye el plan gratuito (Propietario). Mientras no haya cuentas, se cuentan
 * las que ya hay guardadas en este navegador.
 */
export const MAX_FREE_PUBLICATIONS = 1

/** Dice si ya no caben más anuncios en el plan: sin otro dato, el gratuito. */
export const hasReachedLimit = (publishedCount: number, limit = MAX_FREE_PUBLICATIONS) => publishedCount >= limit

/**
 * Lo que se le dice, al abrir el formulario, a quien ya no puede publicar más. `holder` es quien guarda
 * los anuncios: «este navegador» o «tu cuenta».
 */
export const describeLimitReached = (limit: number, holder: string) =>
  limit === MAX_FREE_PUBLICATIONS
    ? { title: FREE_LIMIT_REACHED.title, description: `${FREE_LIMIT_REACHED.reason} y ${holder} ya tiene una.` }
    : {
        title: 'Ya usaste los anuncios de tu plan',
        description: `Tu plan incluye ${limit} anuncios a la vez. Elimina alguno para publicar otro.`,
      }

/** Lo que se le dice a quien ya la usó, tanto al abrir el formulario como al intentar guardar. */
export const FREE_LIMIT_REACHED = {
  title: 'Ya usaste tu publicación gratuita',
  reason: 'El plan Propietario incluye una sola publicación',
}
