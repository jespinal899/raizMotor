import { describe, expect, it } from 'vitest'
import { formatPriceBeforeTax, toPlanTotal } from '@/features/shop/utils/planTotal'
import { ISV_RATE } from '@/shared/constants/tax'

describe('toPlanTotal', () => {
  it.each([
    { monthlyPrice: 599, tax: 89.85, total: 688.85 },
    { monthlyPrice: 999, tax: 149.85, total: 1148.85 },
  ])('a un plan de L $monthlyPrice le suma el impuesto sobre ventas: L $total al mes', ({ monthlyPrice, tax, total }) => {
    // Arrange: precio mensual del plan, sin impuesto

    // Act
    const planTotal = toPlanTotal(monthlyPrice)

    // Assert
    expect(planTotal).toEqual({ price: monthlyPrice, tax, total })
  })

  it('calcula al centavo, sin los decimales de más que deja multiplicar', () => {
    // Arrange
    const monthlyPrice = 333.33

    // Act
    const { tax, total } = toPlanTotal(monthlyPrice, 0.15)

    // Assert
    expect(tax).toBe(50)
    expect(total).toBe(383.33)
  })

  it('si no se indica otra, aplica la tasa general del impuesto', () => {
    // Arrange
    const monthlyPrice = 100

    // Act
    const { tax } = toPlanTotal(monthlyPrice)

    // Assert
    expect(ISV_RATE).toBe(0.15)
    expect(tax).toBe(15)
  })
})

describe('formatPriceBeforeTax', () => {
  it('escribe el precio del plan como se anuncia: en lempiras y avisando de que falta el impuesto', () => {
    // Arrange
    const monthlyPrice = 599

    // Act
    const price = formatPriceBeforeTax(monthlyPrice)

    // Assert
    expect(price.replace(/\s/g, ' ')).toBe('L 599 + ISV')
  })
})
