import type { ContactMessage } from '@/features/contact/types/contact.types'

/** El envío no está configurado todavía; no es un fallo de red ni del visitante. */
export class ContactUnavailableError extends Error {
  constructor() {
    super('El envío de mensajes de contacto aún no está configurado.')
    this.name = 'ContactUnavailableError'
  }
}

export interface ContactService {
  /** Se resuelve cuando el mensaje se entrega y se rechaza si no se pudo enviar. */
  send(message: ContactMessage): Promise<void>
}

/** Implementación provisional mientras no exista el servicio de correo: nunca finge un envío. */
export const createPendingContactService = (): ContactService => ({
  send: async () => {
    throw new ContactUnavailableError()
  },
})

// Único punto donde se elige cómo se envían los mensajes: al configurar el correo, se cambia solo esta línea.
export const contactService: ContactService = createPendingContactService()
