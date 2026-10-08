import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PlanCostSummary from '@/features/shop/components/PlanCostSummary'
import { AGENT_PLANS } from '@/features/shop/data/plans.data'

const [PRO, ELITE] = AGENT_PLANS

// El símbolo y la cifra van separados por un espacio de no separación.
const withPlainSpaces = (text: string) => text.replace(/\s+/g, ' ').trim()

/** El importe que acompaña a un concepto del desglose. */
const amountOf = (concept: string) => withPlainSpaces(screen.getByText(concept).nextElementSibling?.textContent ?? '')

describe('PlanCostSummary', () => {
  it('se titula "Resumen de compra" y dice qué plan se compra, su precio sin impuesto y que es una suscripción mensual', () => {
    // Arrange
    const plan = PRO

    // Act
    render(<PlanCostSummary plan={plan} />)

    // Assert
    expect(screen.getByRole('heading', { level: 3, name: 'Resumen de compra' })).toBeInTheDocument()
    const name = screen.getByText('Agente Pro')
    expect(withPlainSpaces(name.parentElement?.textContent ?? '')).toBe('Agente Pro L 599 + ISV')
    expect(name.parentElement?.nextElementSibling).toHaveTextContent('Suscripción mensual')
  })

  it('detalla el subtotal, el impuesto sobre ventas y el total', () => {
    // Arrange
    const plan = PRO

    // Act
    render(<PlanCostSummary plan={plan} />)

    // Assert
    expect(amountOf('Subtotal')).toBe('L 599.00')
    expect(amountOf('ISV (15 %)')).toBe('L 89.85')
    expect(amountOf('Total')).toBe('L 688.85')
  })

  it('con otro plan, resume ese plan y su total', () => {
    // Arrange
    const plan = ELITE

    // Act
    render(<PlanCostSummary plan={plan} />)

    // Assert
    expect(screen.getByText('Agente Élite')).toBeInTheDocument()
    expect(amountOf('Total')).toBe('L 1,148.85')
  })

  it('debajo del total puede llevar lo que el paso necesite, como las casillas del resumen', () => {
    // Arrange
    const extra = <p>¿Tienes un código de descuento?</p>

    // Act
    render(<PlanCostSummary plan={PRO}>{extra}</PlanCostSummary>)

    // Assert
    const total = screen.getByText('Total')
    const extraComesLater =
      total.compareDocumentPosition(screen.getByText('¿Tienes un código de descuento?')) & Node.DOCUMENT_POSITION_FOLLOWING
    expect(extraComesLater).toBeTruthy()
  })
})
