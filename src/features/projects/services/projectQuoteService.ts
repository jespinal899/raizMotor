import { createPublisherContactService } from '@/features/properties/services/publisherContactService'
import type { ProjectQuoteRequest } from '@/features/properties/services/publisherContactService'
import { QuoteUnavailableError } from '@/features/properties/services/quoteErrors'
import { CAPTCHA_SITE_KEY, takeCaptchaToken } from '@/lib/captcha'
import { supabase } from '@/lib/supabaseClient'

/** Quien recibe la cotización de un proyecto. Repetirla con la misma clave no manda otro correo. */
export interface ProjectQuoteService {
  request(quote: ProjectQuoteRequest, operationKey: string): Promise<void>
}

const client = supabase

/**
 * Con Supabase, la función `contact-publisher` manda la cotización por correo a la cuenta de la inmobiliaria,
 * con la misma verificación contra bots y los mismos límites que el contacto por un anuncio. Sin él, se avisa.
 */
export const projectQuoteService: ProjectQuoteService = client
  ? {
      request: createPublisherContactService({
        invoke: (body) => client.functions.invoke('contact-publisher', { body }),
        takeCaptchaToken: () => takeCaptchaToken(),
        captchaRequired: CAPTCHA_SITE_KEY !== null,
      }).requestForProject,
    }
  : {
      request: async () => {
        throw new QuoteUnavailableError()
      },
    }
