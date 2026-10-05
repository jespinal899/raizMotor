const KEY_BYTES = 16

/**
 * Clave aleatoria que identifica una operación de escritura (crear una cuenta, publicar, enviar un mensaje).
 * Quien la recibe dos veces con la misma clave debe aplicar la operación una sola vez.
 *
 * Usa `getRandomValues` y no `randomUUID`, que el navegador solo ofrece en páginas servidas por HTTPS:
 * al probar el sitio desde el móvil por la red local no estaría disponible.
 */
export const createOperationKey = (): string =>
  Array.from(crypto.getRandomValues(new Uint8Array(KEY_BYTES)), (byte) => byte.toString(16).padStart(2, '0')).join('')
