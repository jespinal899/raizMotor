import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PlanMonthlyPrice from '@/features/shop/components/PlanMonthlyPrice'

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
    expect(textOf(screen.getByText(/^L\s/).parentElement as HTMLElement)).toBe('L 599/mes + ISV mensual')
  })

  it('no agrega un precio equivalente en otra moneda', () => {
    // Arrange
    const lempiras = 999

    // Act
    render(<PlanMonthlyPrice lempiras={lempiras} />)

    // Assert
    expect(screen.queryByText(/^≈/)).not.toBeInTheDocument()
  })
})
