/**
 * Avisos que una página deja a la siguiente al navegar, en el estado de la navegación: no quedan en la
 * dirección, así que recargar o compartir la página no los repite.
 */
export interface NavigationNotice {
  notice: 'passwordUpdated'
}

/** Quien acaba de elegir otra contraseña con el código llega a la portada con este aviso. */
export const PASSWORD_UPDATED_NOTICE: NavigationNotice = { notice: 'passwordUpdated' }

export const isNotice = (state: unknown, notice: NavigationNotice['notice']) =>
  typeof state === 'object' && state !== null && (state as Partial<NavigationNotice>).notice === notice
