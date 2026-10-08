import { describe, expect, it } from 'vitest'
import { paymentModeFor } from '@/features/shop/data/paymentMode'

describe('paymentModeFor', () => {
  it('en el sitio publicado la contratación termina siempre por WhatsApp: el pago simulado no existe ahí', () => {
    // Arrange
    const isDevelopment = false

    // Act
    const mode = paymentModeFor(isDevelopment)

    // Assert
    expect(mode).toBe('whatsapp')
  })

  it('al desarrollar se puede ver la demostración del pago con tarjeta', () => {
    // Arrange
    const isDevelopment = true

    // Act
    const mode = paymentModeFor(isDevelopment)

    // Assert
    expect(mode).toBe('demo')
  })
})
