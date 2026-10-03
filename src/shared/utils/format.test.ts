import { describe, expect, it } from 'vitest'
import { formatArea, formatPrice } from '@/shared/utils/format'

// Intl separa el símbolo y la cifra con un espacio de no separación.
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
