import { describe, expect, it } from 'vitest'
import type { CardDemoValues } from '@/features/shop/utils/cardDemo'
import {
  formatCardExpiry,
  formatCardNumber,
  formatSecurityCode,
  lastCardDigits,
  validateCardDemo,
} from '@/features/shop/utils/cardDemo'

const buildCard = (overrides: Partial<CardDemoValues> = {}): CardDemoValues => ({
  number: '4242 4242 4242 4242',
  expiry: '12/30',
  securityCode: '123',
  holder: 'Ana Mejía',
  ...overrides,
})

describe('formatCardNumber', () => {
  it.each([
    { written: '4242424242424242', expected: '4242 4242 4242 4242' },
    { written: '42424', expected: '4242 4' },
    { written: '4242-4242 4242x4242 9999', expected: '4242 4242 4242 4242' },
  ])('agrupa "$written" de cuatro en cuatro, solo dígitos y sin pasar de dieciséis', ({ written, expected }) => {
    // Arrange: lo que se va escribiendo en el campo

    // Act
    const formatted = formatCardNumber(written)

    // Assert
    expect(formatted).toBe(expected)
  })
})

describe('formatCardExpiry', () => {
  it.each([
    { written: '1', expected: '1' },
    { written: '123', expected: '12/3' },
    { written: '12/30', expected: '12/30' },
    { written: '123099', expected: '12/30' },
  ])('escribe "$written" como mes y año: "$expected"', ({ written, expected }) => {
    // Arrange: lo que se va escribiendo en el campo

    // Act
    const formatted = formatCardExpiry(written)

    // Assert
    expect(formatted).toBe(expected)
  })
})

describe('formatSecurityCode', () => {
  it('deja solo dígitos y no más de cuatro', () => {
    // Arrange
    const written = '12a345'

    // Act
    const formatted = formatSecurityCode(written)

    // Assert
    expect(formatted).toBe('1234')
  })
})

describe('validateCardDemo', () => {
  it('acepta una tarjeta completa', () => {
    // Arrange
    const card = buildCard()

    // Act
    const errors = validateCardDemo(card)

    // Assert
    expect(Object.values(errors).filter(Boolean)).toEqual([])
  })

  it('señala cada dato que falta o está incompleto', () => {
    // Arrange
    const card = buildCard({ number: '4242 4242', expiry: '13/30', securityCode: '12', holder: '  ' })

    // Act
    const errors = validateCardDemo(card)

    // Assert
    expect(errors).toEqual({
      number: 'Escribe los 16 dígitos de la tarjeta.',
      expiry: 'Escribe el vencimiento como MM/AA.',
      securityCode: 'Escribe los 3 o 4 dígitos del código.',
      holder: 'Escribe el nombre como aparece en la tarjeta.',
    })
  })
})

describe('lastCardDigits', () => {
  it('da los cuatro últimos dígitos, que es lo único de la tarjeta que se muestra después', () => {
    // Arrange
    const number = '4242 4242 4242 4321'

    // Act
    const last = lastCardDigits(number)

    // Assert
    expect(last).toBe('4321')
  })
})
