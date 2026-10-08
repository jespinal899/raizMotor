import type { CheckoutField } from '@/features/shop/types/checkout.types'

/** Pasos que muestra el indicador del formulario. */
export const CHECKOUT_STEPS = ['Tus datos', 'Pago', 'Confirmación']

/** Datos que se piden en cada paso, en el mismo orden: son los que se validan antes de dejar avanzar. */
export const CHECKOUT_STEP_FIELDS: CheckoutField[][] = [
  ['firstName', 'lastName', 'document', 'phone', 'email'],
  ['paymentMethod'],
  ['acceptsTerms'],
]
