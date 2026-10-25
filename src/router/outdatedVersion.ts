/**
 * Mensajes con que cada navegador avisa de que no pudo descargar una parte del sitio: Chrome y Edge, Firefox y
 * Safari. Tras publicar una versión nueva, las partes de la anterior ya no existen, y quien tenía el sitio abierto
 * las pide al cambiar de página.
 */
const CHUNK_ERRORS = [
  'Failed to fetch dynamically imported module',
  'error loading dynamically imported module',
  'Importing a module script failed',
]

/** Si el fallo es una parte del sitio que ya no existe: se arregla recargando la página. */
export const isOutdatedVersionError = (error: unknown) =>
  error instanceof Error && CHUNK_ERRORS.some((message) => error.message.includes(message))

const RELOADED_AT = 'domusraiz:recarga-por-version'
/** Tiempo en que no se vuelve a recargar: si el fallo sigue tras recargar, no es una versión vieja. */
const RELOAD_WINDOW_MS = 10_000

/**
 * Recarga la página para traer la versión publicada, una sola vez: si ya se recargó hace poco, devuelve `false`
 * y la página de error lo explica. Sin acceso al almacenamiento de la sesión, no recarga, para no hacerlo sin fin.
 */
export const reloadOnce = (reload: () => void = () => window.location.reload(), now = Date.now()) => {
  try {
    const last = Number(sessionStorage.getItem(RELOADED_AT))
    if (last && now - last < RELOAD_WINDOW_MS) return false
    sessionStorage.setItem(RELOADED_AT, String(now))
  } catch {
    return false
  }

  reload()
  return true
}
