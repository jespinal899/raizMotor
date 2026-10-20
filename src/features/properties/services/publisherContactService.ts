import {
  QuoteCaptchaError,
  QuoteThrottledError,
  QuoteUnavailableError,
} from '@/features/properties/services/quoteErrors'
import type { QuoteRequest } from '@/features/properties/types/quote.types'

/** Lo que responde Supabase al llamar a una función: el fallo, si lo hubo, nunca una excepción. */
export type InvokeContactPublisher = (body: Record<string, string>) => PromiseLike<{ error: unknown }>

interface PublisherContactOptions {
  /** Llama a la función `contact-publisher` (supabase/functions) con estos datos. */
  invoke: InvokeContactPublisher
  /** El token de la verificación contra bots, que queda usado; `null` si no lo hay. */
  takeCaptchaToken: () => Promise<string | null>
  /** Si el sitio exige la verificación: sin token no se llama a la función, que lo rechazaría. */
  captchaRequired: boolean
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** El código HTTP con que respondió la función, si llegó a responder. */
const statusOf = (error: unknown): number | undefined => {
  const context = (error as { context?: { status?: unknown } } | null)?.context

  return typeof context?.status === 'number' ? context.status : undefined
}

/** El fallo con que rechazar, según lo que respondió la función. */
const toFailure = (error: unknown) => {
  const status = statusOf(error)
  if (status === 429) return new QuoteThrottledError()
  if (status === 403) return new QuoteCaptchaError()

  return error
}

/** La cotización de un proyecto: quién la pide y, si eligió uno, el modelo que le interesa. */
export interface ProjectQuoteRequest extends Omit<QuoteRequest, 'propertyId'> {
  projectId: string
  model?: string
}

/**
 * Contacto con quien publicó un anuncio o un proyecto: la función del servidor le envía por correo los datos de quien
 * escribe. El correo del publicador no pasa por el navegador. La clave del envío evita mandarlo dos veces.
 */
export const createPublisherContactService = ({ invoke, takeCaptchaToken, captchaRequired }: PublisherContactOptions) => ({
  request: async ({ propertyId, fullName, email, phone }: QuoteRequest, operationKey: string) => {
    // Las propiedades de ejemplo no son anuncios de nadie: no hay a quién escribirle.
    if (!UUID.test(propertyId)) throw new QuoteUnavailableError()

    const captchaToken = await takeCaptchaToken()
    if (captchaRequired && !captchaToken) throw new QuoteCaptchaError()

    const { error } = await invoke({
      propertyId,
      fullName,
      email,
      phone,
      operationKey,
      ...(captchaToken ? { captchaToken } : {}),
    })

    if (error) throw toFailure(error)
  },

  /** Lo mismo por un proyecto: la cotización llega por correo a la cuenta de la inmobiliaria. */
  requestForProject: async ({ projectId, model, fullName, email, phone }: ProjectQuoteRequest, operationKey: string) => {
    // Los proyectos de ejemplo no son de nadie: no hay a quién escribirle.
    if (!UUID.test(projectId)) throw new QuoteUnavailableError()

    const captchaToken = await takeCaptchaToken()
    if (captchaRequired && !captchaToken) throw new QuoteCaptchaError()

    const { error } = await invoke({
      projectId,
      ...(model?.trim() ? { model: model.trim() } : {}),
      fullName,
      email,
      phone,
      operationKey,
      ...(captchaToken ? { captchaToken } : {}),
    })

    if (error) throw toFailure(error)
  },
})
