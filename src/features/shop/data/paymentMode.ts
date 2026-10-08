/**
 * Cómo termina la contratación: pidiendo el plan por WhatsApp o, solo como muestra de diseño, con una
 * pantalla de pago con tarjeta simulada.
 */
export type PaymentMode = 'whatsapp' | 'demo'

/**
 * La pantalla de pago con tarjeta es una demostración de diseño: no cobra nada. Por eso solo existe al
 * desarrollar; el sitio publicado pide el plan por WhatsApp hasta que haya una pasarela de pago.
 */
export const paymentModeFor = (isDevelopment: boolean): PaymentMode => (isDevelopment ? 'demo' : 'whatsapp')

export const PAYMENT_MODE: PaymentMode = paymentModeFor(import.meta.env.DEV)
