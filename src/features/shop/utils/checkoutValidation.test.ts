import { describe, expect, it } from 'vitest'
import type { CheckoutFormValues } from '@/features/shop/types/checkout.types'
import { MAX_NAME_LENGTH, validateCheckout } from '@/features/shop/utils/checkoutValidation'

const buildCheckout = (overrides: Partial<CheckoutFormValues> = {}): CheckoutFormValues => ({
  firstName: 'Ana',
  lastName: 'Mejía',
  document: '',
  phone: '9999-9999',
  email: 'ana@gmail.com',
  paymentMethod: 'tarjeta',
  acceptsTerms: true,
  ...overrides,
})

describe('validateCheckout', () => {
  it('acepta una solicitud completa, también sin documento', () => {
    // Arrange
    const values = buildCheckout()

    // Act
    const errors = validateCheckout(values)

    // Assert
    expect(Object.values(errors).filter(Boolean)).toEqual([])
  })

  it('pide el nombre y el apellido, cada uno en su campo', () => {
    // Arrange
    const values = buildCheckout({ firstName: '  ', lastName: '' })

    // Act
    const errors = validateCheckout(values)

    // Assert
    expect(errors.firstName).toBe('Escribe tu nombre.')
    expect(errors.lastName).toBe('Escribe tu apellido.')
  })

  it('no acepta un nombre o un apellido más largo que su campo', () => {
    // Arrange
    const tooLong = 'a'.repeat(MAX_NAME_LENGTH + 1)
    const values = buildCheckout({ firstName: tooLong, lastName: tooLong })

    // Act
    const errors = validateCheckout(values)

    // Assert
    expect(errors.firstName).toBe(`No puede pasar de ${MAX_NAME_LENGTH} caracteres.`)
    expect(errors.lastName).toBe(`No puede pasar de ${MAX_NAME_LENGTH} caracteres.`)
  })

  it('el documento es opcional, pero si se escribe debe tener forma de DNI o de RTN', () => {
    // Arrange
    const values = [
      buildCheckout({ document: '' }),
      buildCheckout({ document: '0801-1990-12345' }),
      buildCheckout({ document: '0801-1990' }),
    ]

    // Act
    const errors = values.map((checkout) => validateCheckout(checkout).document)

    // Assert
    expect(errors).toEqual([undefined, undefined, 'Escribe los 13 dígitos del DNI o los 14 del RTN.'])
  })

  it('pide un celular de Honduras completo y un correo con forma de correo', () => {
    // Arrange
    const values = [buildCheckout({ phone: '', email: '' }), buildCheckout({ phone: '9999-99', email: 'ana@gmail' })]

    // Act
    const errors = values.map(validateCheckout)

    // Assert
    expect(errors[0].phone).toBe('Escribe tu celular.')
    expect(errors[0].email).toBe('Escribe tu correo.')
    expect(errors[1].phone).toBe('Escribe los 8 dígitos de tu número.')
    expect(errors[1].email).toBe('Revisa el correo: debe tener el formato nombre@dominio.com.')
  })

  it('pide elegir la forma de pago y aceptar los términos y condiciones', () => {
    // Arrange
    const values = buildCheckout({ paymentMethod: '', acceptsTerms: false })

    // Act
    const errors = validateCheckout(values)

    // Assert
    expect(errors.paymentMethod).toBe('Elige cómo quieres pagar.')
    expect(errors.acceptsTerms).toBe('Acepta los términos y condiciones para continuar.')
  })
})
