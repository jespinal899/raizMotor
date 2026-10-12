import { createPublisherContactService } from '@/features/properties/services/publisherContactService'
import { QuoteUnavailableError } from '@/features/properties/services/quoteErrors'
import type { QuoteRequest } from '@/features/properties/types/quote.types'
import { CAPTCHA_SITE_KEY, takeCaptchaToken } from '@/lib/captcha'
import { supabase } from '@/lib/supabaseClient'

export { QuoteCaptchaError, QuoteThrottledError, QuoteUnavailableError } from '@/features/properties/services/quoteErrors'

/** Quien recibe los datos de quien quiere que el publicador lo contacte. */
export interface QuoteService {
  /**
   * Se resuelve cuando los datos quedan entregados y se rechaza si no se pudieron enviar. Es idempotente: si
   * llega dos veces con la misma clave, por un reintento o un doble envío, se envían una sola vez.
   */
  request(quote: QuoteRequest, operationKey: string): Promise<void>
}

/** Sin servidor no hay a quién enviarlos: nunca finge que salieron. */
export const createPendingQuoteService = (): QuoteService => ({
  request: async () => {
    throw new QuoteUnavailableError()
  },
})

const client = supabase

// Único punto donde se elige cómo se contacta al publicador: con Supabase, por correo desde el servidor.
export const quoteService: QuoteService = client
  ? createPublisherContactService({
      invoke: (body) => client.functions.invoke('contact-publisher', { body }),
      takeCaptchaToken: () => takeCaptchaToken(),
      captchaRequired: CAPTCHA_SITE_KEY !== null,
    })
  : createPendingQuoteService()
