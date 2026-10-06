import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PropertyPrice from '@/features/properties/components/PropertyPrice'

const textOf = (element: HTMLElement) => element.textContent?.replace(/\s+/g, ' ').trim()
const price = (amount: RegExp) => textOf(screen.getByText(amount).closest('p') as HTMLElement)

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

  it('el texto de delante convive con la aclaración del alquiler', () => {
    // Arrange
    const property = { price: 850, operation: 'alquiler' } as const

    // Act
    render(<PropertyPrice property={property} prefix="Desde" />)

    // Assert
    expect(price(/850/)).toBe('Desde $ 850 / mes')
  })
})
