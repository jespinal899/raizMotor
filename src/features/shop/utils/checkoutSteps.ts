import type { CheckoutField } from '@/features/shop/types/checkout.types'

/** Pasos que muestra el indicador del formulario. */
export const CHECKOUT_STEPS = ['Datos de suscripción', 'Resumen', 'Medio de pago']

/** Posición de cada paso en `CHECKOUT_STEPS`. */
export const CHECKOUT_STEP = { subscription: 0, summary: 1, payment: 2 } as const

/**
 * Datos que se piden en cada paso, en el mismo orden: son los que se validan antes de dejar avanzar. Los
 * términos se aceptan en el resumen, antes de pasar al pago.
 */
export const CHECKOUT_STEP_FIELDS: CheckoutField[][] = [
  ['firstName', 'lastName', 'document', 'phone', 'email'],
  ['acceptsTerms'],
  ['paymentMethod'],
]
