import type { FieldErrors } from '@/shared/utils/validators'

/** Lo que se escribe en el formulario de cotización. */
export interface QuoteFormValues {
  fullName: string
  email: string
  /** Solo el número local: el prefijo del país va fijo en el campo. */
  phone: string
  acceptsTerms: boolean
}

export type QuoteFormErrors = FieldErrors<QuoteFormValues>

/** Quién pide la cotización, con sus datos ya listos para enviar. */
export interface QuoteApplicant {
  fullName: string
  email: string
  /** Completo y sin separadores: +50499999999. */
  phone: string
}

export interface QuoteRequest extends QuoteApplicant {
  /** La propiedad que se quiere cotizar. */
  propertyId: string
}

/** Por qué no salió la solicitud: `unavailable` significa que las cotizaciones aún no están activas. */
export type QuoteFailure = 'unavailable' | 'failed'

export type QuoteFormStatus = 'idle' | 'sending' | 'sent' | QuoteFailure
