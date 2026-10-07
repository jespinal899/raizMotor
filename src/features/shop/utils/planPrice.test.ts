import { describe, expect, it } from 'vitest'
import { formatPlanPrice } from '@/features/shop/utils/planPrice'

describe('formatPlanPrice', () => {
  it('rotula un plan gratuito como "Gratis"', () => {
    // Arrange
    const price = { kind: 'free' } as const

    // Act
    const label = formatPlanPrice(price)

    // Assert
    expect(label).toEqual({ amount: 'Gratis' })
  })

  it('rotula un plan mensual como "Desde … / mes"', () => {
    // Arrange
    const price = { kind: 'monthly', from: 50 } as const

    // Act
    const label = formatPlanPrice(price)

    // Assert
    expect(label.prefix).toBe('Desde')
    expect(label.amount.replace(/\s/g, ' ')).toBe('$ 50')
    expect(label.suffix).toBe('/ mes')
  })

  it('rotula un plan aún sin definir como "Próximamente", sin importe', () => {
    // Arrange
    const price = { kind: 'upcoming' } as const

    // Act
    const label = formatPlanPrice(price)

    // Assert
    expect(label).toEqual({ amount: 'Próximamente' })
  })
})
