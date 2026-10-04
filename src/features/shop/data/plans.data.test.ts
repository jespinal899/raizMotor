import { describe, expect, it } from 'vitest'
import { PLANS } from '@/features/shop/data/plans.data'
import { ROUTES } from '@/shared/constants/routes'

describe('PLANS', () => {
  it('ofrece un plan para particulares, inmobiliarias y constructoras, en ese orden', () => {
    // Arrange
    const expectedIds = ['particular', 'inmobiliaria', 'constructora']

    // Act
    const ids = PLANS.map((plan) => plan.id)

    // Assert
    expect(ids).toEqual(expectedIds)
  })

  it('cada botón lleva a una página que existe', () => {
    // Arrange
    const knownPages: string[] = [ROUTES.publish, ROUTES.contact]

    // Act
    const destinations = PLANS.map((plan) => plan.action.to.split('?')[0])

    // Assert
    expect(knownPages).toEqual(expect.arrayContaining(destinations))
  })

  it('los planes de pago envían al contacto indicando de qué plan se trata', () => {
    // Arrange
    const paidPlans = PLANS.filter((plan) => plan.price.kind !== 'free')

    // Act
    const destinations = paidPlans.map((plan) => plan.action.to)

    // Assert
    expect(destinations).toEqual(['/contacto?plan=inmobiliaria', '/contacto?plan=constructora'])
  })

  it('destaca un único plan', () => {
    // Arrange
    const isHighlighted = (plan: (typeof PLANS)[number]) => plan.highlighted === true

    // Act
    const highlighted = PLANS.filter(isHighlighted).map((plan) => plan.id)

    // Assert
    expect(highlighted).toEqual(['inmobiliaria'])
  })

  it('todos los planes describen al menos una ventaja', () => {
    // Arrange
    const plansWithoutFeatures = PLANS.filter((plan) => plan.features.length === 0)

    // Act
    const count = plansWithoutFeatures.length

    // Assert
    expect(count).toBe(0)
  })
})
