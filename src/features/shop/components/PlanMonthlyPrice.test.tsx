import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PlanMonthlyPrice from '@/features/shop/components/PlanMonthlyPrice'
import { CONVERSION_NOTE } from '@/shared/constants/currency'
import { formatLempirasInDollars } from '@/shared/utils/format'

// El símbolo y la cifra van separados por un espacio de no separación.
const withPlainSpaces = (text: string) => text.replace(/\s+/g, ' ').trim()
const textOf = (element: HTMLElement) => withPlainSpaces(element.textContent ?? '')

describe('PlanMonthlyPrice', () => {
  it('muestra el precio en lempiras y aclara que es mensual y que no incluye el impuesto', () => {
    // Arrange
    const lempiras = 599

    // Act
    render(<PlanMonthlyPrice lempiras={lempiras} />)

    // Assert
    expect(textOf(screen.getByText(/^L\s/).parentElement as HTMLElement)).toBe('L 599 + ISV mensual')
  })

  it('debajo da su equivalente aproximado en dólares', () => {
    // Arrange
    const lempiras = 999

    // Act
    render(<PlanMonthlyPrice lempiras={lempiras} />)

    // Assert
    expect(textOf(screen.getByText(/^≈/))).toBe(withPlainSpaces(`≈ ${formatLempirasInDollars(lempiras)}`))
  })

  it('el equivalente en dólares dice con qué tipo de cambio se calculó', () => {
    // Arrange
    const lempiras = 999

    // Act
    render(<PlanMonthlyPrice lempiras={lempiras} />)

    // Assert
    expect(screen.getByText(/^≈/)).toHaveAttribute('title', CONVERSION_NOTE)
  })
})
