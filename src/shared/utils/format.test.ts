import { describe, expect, it } from 'vitest'
import { EXCHANGE_RATE } from '@/shared/constants/currency'
import {
  formatArea,
  formatLempiras,
  formatLempirasExact,
  formatLongDate,
  formatNumber,
  formatPrice,
  formatPriceInLempiras,
  toLempiras,
} from '@/shared/utils/format'

// El símbolo y la cifra van separados por un espacio de no separación.
const withPlainSpaces = (text: string) => text.replace(/\s/g, ' ')

describe('formatPrice', () => {
  it('muestra el precio en dólares con separador de miles y sin decimales', () => {
    // Arrange
    const price = 285000

    // Act
    const formatted = formatPrice(price)

    // Assert
    expect(withPlainSpaces(formatted)).toBe('$ 285,000')
  })

  it('redondea los decimales', () => {
    // Arrange
    const price = 1499.6

    // Act
    const formatted = formatPrice(price)

    // Assert
    expect(withPlainSpaces(formatted)).toBe('$ 1,500')
  })

  it('no deja que el símbolo y la cifra se separen en dos líneas', () => {
    // Arrange
    const price = 285000

    // Act
    const formatted = formatPrice(price)

    // Assert
    expect(formatted).not.toContain(' ')
  })
})

describe('toLempiras', () => {
  it('convierte dólares a lempiras con el tipo de cambio indicado', () => {
    // Arrange
    const dollars = 1000

    // Act
    const lempiras = toLempiras(dollars, 25)

    // Assert
    expect(lempiras).toBe(25000)
  })

  it('redondea al lempira: los centavos de una conversión aproximada no dicen nada', () => {
    // Arrange
    const dollars = 3

    // Act
    const lempiras = toLempiras(dollars, 26.89)

    // Assert
    expect(lempiras).toBe(81)
  })

  it('si no se indica otro, usa el tipo de cambio de referencia', () => {
    // Arrange
    const dollars = 100

    // Act
    const lempiras = toLempiras(dollars)

    // Assert
    expect(lempiras).toBe(Math.round(100 * EXCHANGE_RATE.lempirasPerDollar))
  })
})

describe('formatPriceInLempiras', () => {
  it('muestra en lempiras un precio en dólares, con su símbolo y separador de miles', () => {
    // Arrange
    const dollars = 145000

    // Act
    const formatted = formatPriceInLempiras(dollars, 25)

    // Assert
    expect(withPlainSpaces(formatted)).toBe('L 3,625,000')
  })

  it('tampoco deja que el símbolo y la cifra se separen', () => {
    // Arrange
    const dollars = 145000

    // Act
    const formatted = formatPriceInLempiras(dollars, 25)

    // Assert
    expect(formatted).not.toContain(' ')
  })
})

describe('formatArea', () => {
  it('añade la unidad y el separador de miles', () => {
    // Arrange
    const squareMeters = 2500

    // Act
    const formatted = formatArea(squareMeters)

    // Assert
    expect(formatted).toBe('2,500 m²')
  })
})

describe('formatNumber', () => {
  it('separa los miles de una cantidad', () => {
    // Arrange
    const count = 12500

    // Act
    const formatted = formatNumber(count)

    // Assert
    expect(formatted).toBe('12,500')
  })
})

describe('formatLongDate', () => {
  it('escribe una fecha con el mes en letras, como se lee en Honduras', () => {
    // Arrange
    const date = '2026-10-02'

    // Act
    const formatted = formatLongDate(date)

    // Assert
    expect(formatted).toBe('2 de octubre de 2026')
  })

  it('no cambia de día según la zona horaria de quien la lee', () => {
    // Arrange
    const firstOfMonth = '2026-03-01'

    // Act
    const formatted = formatLongDate(firstOfMonth)

    // Assert
    expect(formatted).toBe('1 de marzo de 2026')
  })
})

describe('formatLempiras', () => {
  it('muestra un importe en lempiras con su símbolo, separador de miles y sin decimales', () => {
    // Arrange
    const lempiras = 1599

    // Act
    const formatted = formatLempiras(lempiras)

    // Assert
    expect(withPlainSpaces(formatted)).toBe('L 1,599')
    expect(formatted).not.toContain(' ')
  })
})

describe('formatLempirasExact', () => {
  it.each([
    { amount: 688.85, expected: 'L 688.85' },
    { amount: 599, expected: 'L 599.00' },
    { amount: 1148.85, expected: 'L 1,148.85' },
  ])('muestra L $amount con sus dos decimales, como en un cobro', ({ amount, expected }) => {
    // Arrange: importe en lempiras

    // Act
    const formatted = formatLempirasExact(amount)

    // Assert
    expect(withPlainSpaces(formatted)).toBe(expected)
    expect(formatted).not.toContain(' ')
  })
})
