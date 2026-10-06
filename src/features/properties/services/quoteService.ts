import type { QuoteRequest } from '@/features/properties/types/quote.types'

/** Las cotizaciones no están conectadas todavía; no es un fallo de red ni de quien la pide. */
export class QuoteUnavailableError extends Error {
  constructor() {
    super('El envío de cotizaciones aún no está configurado.')
    this.name = 'QuoteUnavailableError'
  }
}

export interface QuoteService {
  /**
   * Se resuelve cuando la solicitud queda entregada y se rechaza si no se pudo enviar. Es idempotente: si
   * llega dos veces con la misma clave, por un reintento o un doble envío, se registra una sola vez.
   */
  request(quote: QuoteRequest, operationKey: string): Promise<void>
}

/** Implementación provisional mientras no exista el servidor: nunca finge que la solicitud salió. */
export const createPendingQuoteService = (): QuoteService => ({
  request: async () => {
    throw new QuoteUnavailableError()
  },
})

// Único punto donde se elige cómo se envían las cotizaciones: al conectar el servidor, se cambia solo esta línea.
export const quoteService: QuoteService = createPendingQuoteService()
