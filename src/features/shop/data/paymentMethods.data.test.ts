import { describe, expect, it } from 'vitest'
import { PAYMENT_METHODS, PAYMENT_METHOD_OPTIONS } from '@/features/shop/data/paymentMethods.data'

describe('PAYMENT_METHODS', () => {
  it('ofrece pagar con tarjeta por un enlace o por transferencia, en ese orden', () => {
    // Arrange
    const expectedOptions = [
      { value: 'tarjeta', label: 'Tarjeta de débito o crédito' },
      { value: 'transferencia', label: 'Transferencia o depósito' },
    ]

    // Act
    const options = PAYMENT_METHOD_OPTIONS.map(({ value, label }) => ({ value, label }))

    // Assert
    expect(options).toEqual(expectedOptions)
  })

  it('cada forma de pago explica qué pasa después de elegirla', () => {
    // Arrange
    const methods = Object.values(PAYMENT_METHODS)

    // Act
    const descriptions = methods.map((method) => method.description)

    // Assert
    expect(descriptions[0]).toMatch(/enlace de pago/)
    expect(descriptions[1]).toMatch(/BAC Credomatic/)
    expect(descriptions.every((description) => description.includes('WhatsApp'))).toBe(true)
  })

  it('el pago con tarjeta aclara que sus datos no pasan por el sitio', () => {
    // Arrange
    const card = PAYMENT_METHODS.tarjeta

    // Act
    const { description } = card

    // Assert
    expect(description).toMatch(/Los datos de tu tarjeta no pasan por/)
  })
})
