import { describe, expect, it } from 'vitest'
import type { QuoteFormValues } from '@/features/properties/types/quote.types'
import { MAX_FULL_NAME_LENGTH, validateQuote } from '@/features/properties/utils/quoteValidation'

const buildQuote = (overrides: Partial<QuoteFormValues> = {}): QuoteFormValues => ({
  fullName: 'Ana Mejía',
  email: 'ana@gmail.com',
  phone: '9999-9999',
  acceptsTerms: true,
  ...overrides,
})

describe('validateQuote', () => {
  it('acepta una solicitud completa', () => {
    // Arrange
    const values = buildQuote()

    // Act
    const errors = validateQuote(values)

    // Assert
    expect(errors).toEqual({ fullName: undefined, email: undefined, phone: undefined, acceptsTerms: undefined })
  })

  it('pide el nombre y el apellido', () => {
    // Arrange
    const values = buildQuote({ fullName: '   ' })

    // Act
    const errors = validateQuote(values)

    // Assert
    expect(errors.fullName).toBe('Escribe tu nombre y apellido.')
  })

  it('con una sola palabra, pide también el apellido', () => {
    // Arrange
    const values = buildQuote({ fullName: ' Ana ' })

    // Act
    const errors = validateQuote(values)

    // Assert
    expect(errors.fullName).toBe('Escribe también tu apellido.')
  })

  it('acepta un nombre justo en el límite de largo y rechaza el que lo pasa', () => {
    // Arrange
    const atLimit = `Ana ${'a'.repeat(MAX_FULL_NAME_LENGTH - 4)}`
    const overLimit = `${atLimit}a`

    // Act
    const errors = [validateQuote(buildQuote({ fullName: atLimit })), validateQuote(buildQuote({ fullName: overLimit }))]

    // Assert
    expect(errors[0].fullName).toBeUndefined()
    expect(errors[1].fullName).toBe(`El nombre no puede pasar de ${MAX_FULL_NAME_LENGTH} caracteres.`)
  })

  it('pide un correo con forma de correo', () => {
    // Arrange
    const values = [buildQuote({ email: '' }), buildQuote({ email: 'ana@gmail' })]

    // Act
    const errors = values.map(validateQuote)

    // Assert
    expect(errors[0].email).toBe('Escribe tu correo.')
    expect(errors[1].email).toBe('Revisa el correo: debe tener el formato nombre@dominio.com.')
  })

  it('pide un teléfono de Honduras completo', () => {
    // Arrange
    const values = [buildQuote({ phone: '' }), buildQuote({ phone: '9999-99' }), buildQuote({ phone: '1999-9999' })]

    // Act
    const errors = values.map(validateQuote)

    // Assert
    expect(errors[0].phone).toBe('Escribe tu teléfono.')
    expect(errors[1].phone).toBe('Escribe los 8 dígitos de tu número.')
    expect(errors[2].phone).toBe('Revisa el número: en Honduras empiezan por 2, 3, 7, 8 o 9.')
  })

  it('no deja cotizar sin aceptar los términos y condiciones', () => {
    // Arrange
    const values = buildQuote({ acceptsTerms: false })

    // Act
    const errors = validateQuote(values)

    // Assert
    expect(errors.acceptsTerms).toBe('Acepta los términos y condiciones para cotizar.')
  })
})
