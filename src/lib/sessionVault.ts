/** Lo que el servicio de cuentas necesita de un almacén para guardar la sesión. */
type SessionStore = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

export interface SessionVault extends SessionStore {
  /** Lo decide quien inicia sesión, y vale para lo que se guarde desde entonces. */
  remember(remember: boolean): void
}

/**
 * Dónde se guarda la sesión: en el almacén duradero si la persona pidió que se la recuerde en este
 * dispositivo y, si no, en el de la pestaña, que el navegador borra al cerrarla.
 */
export const createSessionVault = (durable: Storage, temporary: Storage): SessionVault => {
  /** `null` hasta que alguien inicia sesión: tras recargar la página, la sesión sigue donde estaba. */
  let chosen: Storage | null = null

  const holding = (key: string) => (temporary.getItem(key) === null ? durable : temporary)

  return {
    remember: (remember) => {
      chosen = remember ? durable : temporary
    },

    getItem: (key) => temporary.getItem(key) ?? durable.getItem(key),

    setItem: (key, value) => {
      const target = chosen ?? holding(key)
      const other = target === durable ? temporary : durable

      // La sesión vive en un solo sitio: si cambió la preferencia, no queda una copia en el otro.
      other.removeItem(key)
      target.setItem(key, value)
    },

    removeItem: (key) => {
      durable.removeItem(key)
      temporary.removeItem(key)
    },
  }
}
