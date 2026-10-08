import type { LucideIcon } from 'lucide-react'
import type { FieldErrors } from '@/shared/utils/validators'

export type PaymentMethodId = 'tarjeta' | 'transferencia'

export interface PaymentMethod {
  label: string
  /** Qué pasa después de elegirla. */
  description: string
  icon: LucideIcon
}

/** Lo que se escribe en el formulario para contratar un plan. */
export interface CheckoutFormValues {
  firstName: string
  lastName: string
  /** DNI o RTN. Es opcional. */
  document: string
  /** Solo el número local: el prefijo del país va fijo en el campo. */
  phone: string
  email: string
  /** Cadena vacía mientras no se elige. */
  paymentMethod: PaymentMethodId | ''
  acceptsTerms: boolean
}

export type CheckoutField = keyof CheckoutFormValues

export type CheckoutFormErrors = FieldErrors<CheckoutFormValues>

/** La solicitud de un plan: quién lo pide, con sus datos ya listos para enviar, y cómo quiere pagar. */
export interface PlanRequest {
  firstName: string
  lastName: string
  /** Solo sus dígitos; vacío si la persona no lo dio. */
  document: string
  /** Completo y sin separadores: +50499999999. */
  phone: string
  email: string
  paymentMethod: PaymentMethodId
}

/** Un dato con su valor, como se lista en un resumen. */
export interface DetailRow {
  label: string
  value: string
}
