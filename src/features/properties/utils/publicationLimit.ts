/**
 * Publicaciones que incluye el plan gratuito (Propietario). Mientras no haya cuentas, se cuentan
 * las que ya hay guardadas en este navegador.
 */
export const MAX_FREE_PUBLICATIONS = 1

export const hasReachedFreeLimit = (publishedCount: number) => publishedCount >= MAX_FREE_PUBLICATIONS

/** Lo que se le dice a quien ya la usó, tanto al abrir el formulario como al intentar guardar. */
export const FREE_LIMIT_REACHED = {
  title: 'Ya usaste tu publicación gratuita',
  reason: 'El plan Propietario incluye una sola publicación',
}
