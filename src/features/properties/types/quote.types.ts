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

/**
 * Por qué no salieron los datos: `unavailable`, el contacto por correo no está activo; `throttled`, llegaron
 * demasiados en poco tiempo; `captcha`, no se pudo comprobar que quien escribe no es un bot.
 */
export type QuoteFailure = 'unavailable' | 'throttled' | 'captcha' | 'failed'

export type QuoteFormStatus = 'idle' | 'sending' | 'sent' | QuoteFailure
