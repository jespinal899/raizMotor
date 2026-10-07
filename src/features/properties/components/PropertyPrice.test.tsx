import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PropertyPrice from '@/features/properties/components/PropertyPrice'
import { EXCHANGE_RATE } from '@/shared/constants/currency'
import { formatPriceInLempiras } from '@/shared/utils/format'

const textOf = (element: HTMLElement) => element.textContent?.replace(/\s+/g, ' ').trim()
const price = (amount: RegExp) => textOf(screen.getByText(amount).closest('p') as HTMLElement)
const inLempiras = (dollars: number) => formatPriceInLempiras(dollars).replace(/\s+/g, ' ')

describe('PropertyPrice', () => {
  it('muestra el precio de una venta, sin nada más', () => {
    // Arrange
    const property = { price: 420000, operation: 'venta' } as const

    // Act
    render(<PropertyPrice property={property} />)

    // Assert
    expect(price(/420,000/)).toBe('$ 420,000')
  })

  it('en un alquiler aclara que el precio es por mes', () => {
    // Arrange
    const property = { price: 850, operation: 'alquiler' } as const

    // Act
    render(<PropertyPrice property={property} />)

    // Assert
    expect(price(/850/)).toBe('$ 850 / mes')
  })

  it('con un texto delante, lo antepone al precio', () => {
    // Arrange
    const property = { price: 420000, operation: 'venta' } as const

    // Act
    render(<PropertyPrice property={property} prefix="Desde" />)

    // Assert
    expect(price(/420,000/)).toBe('Desde $ 420,000')
  })

  it('debajo del precio en dólares dice su equivalente aproximado en lempiras', () => {
    // Arrange
    const property = { price: 420000, operation: 'venta' } as const

    // Act
    render(<PropertyPrice property={property} />)

    // Assert
    const lempiras = screen.getByText(/^≈/)
    expect(textOf(lempiras)).toBe(`≈ ${inLempiras(420000)}`)
    expect(screen.getByText(/420,000/).compareDocumentPosition(lempiras)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
  })

  it('en un alquiler, el equivalente en lempiras también es por mes', () => {
    // Arrange
    const property = { price: 850, operation: 'alquiler' } as const

    // Act
    render(<PropertyPrice property={property} />)

    // Assert
    expect(textOf(screen.getByText(/^≈/))).toBe(`≈ ${inLempiras(850)} / mes`)
  })

  it('el equivalente en lempiras dice con qué tipo de cambio se calculó', () => {
    // Arrange
    const property = { price: 420000, operation: 'venta' } as const

    // Act
    render(<PropertyPrice property={property} />)

    // Assert
    expect(screen.getByText(/^≈/)).toHaveAttribute(
      'title',
      `Conversión aproximada: L ${EXCHANGE_RATE.lempirasPerDollar} por $ 1, tipo de cambio de referencia del Banco Central de Honduras.`,
    )
  })

  it('el texto de delante convive con la aclaración del alquiler', () => {
    // Arrange
    const property = { price: 850, operation: 'alquiler' } as const

    // Act
    render(<PropertyPrice property={property} prefix="Desde" />)

    // Assert
    expect(price(/850/)).toBe('Desde $ 850 / mes')
  })
})
