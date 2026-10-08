import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PlanOrderSummary from '@/features/shop/components/PlanOrderSummary'
import { AGENT_PLANS } from '@/features/shop/data/plans.data'

const [PRO, ELITE] = AGENT_PLANS

// El símbolo y la cifra van separados por un espacio de no separación.
const withPlainSpaces = (text: string) => text.replace(/\s+/g, ' ').trim()

/** El importe que acompaña a un concepto del desglose. */
const amountOf = (concept: string) => withPlainSpaces(screen.getByText(concept).nextElementSibling?.textContent ?? '')

describe('PlanOrderSummary', () => {
  it('resume el plan elegido con lo que incluye, bajo un título de sección del paso', () => {
    // Arrange
    const plan = PRO

    // Act
    render(<PlanOrderSummary plan={plan} />)

    // Assert
    expect(screen.getByRole('heading', { level: 3, name: 'Resumen de tu plan' })).toBeInTheDocument()
    expect(screen.getByText('Agente Pro')).toBeInTheDocument()
    const features = screen.getAllByRole('listitem').map((item) => withPlainSpaces(item.textContent ?? ''))
    expect(features).toEqual(plan.features.map(({ text }) => text))
  })

  it('desglosa lo que se paga cada mes: el plan, el impuesto sobre ventas y el total', () => {
    // Arrange
    const plan = PRO

    // Act
    render(<PlanOrderSummary plan={plan} />)

    // Assert
    expect(amountOf('Plan mensual')).toBe('L 599.00')
    expect(amountOf('ISV (15 %)')).toBe('L 89.85')
    expect(amountOf('Total al mes')).toBe('L 688.85')
  })

  it('con otro plan, resume ese plan y su total', () => {
    // Arrange
    const plan = ELITE

    // Act
    render(<PlanOrderSummary plan={plan} />)

    // Assert
    expect(screen.getByText('Agente Élite')).toBeInTheDocument()
    expect(amountOf('Total al mes')).toBe('L 1,148.85')
  })
})
