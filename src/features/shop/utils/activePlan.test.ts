import { describe, expect, it } from 'vitest'
import { toActivePlan } from '@/features/shop/utils/activePlan'

describe('toActivePlan', () => {
  it.each([
    { when: 'una sola publicación es el plan Propietario, que es gratis', limit: 1, expected: { name: 'Propietario', isFree: true } },
    { when: 'veinticinco son el plan Agente Pro', limit: 25, expected: { name: 'Agente Pro', isFree: false } },
    { when: 'cien son el plan Agente Élite', limit: 100, expected: { name: 'Agente Élite', isFree: false } },
    {
      when: 'una cantidad que no es la de ningún plan en venta es un plan a medida',
      limit: 40,
      expected: { name: 'Plan a medida', isFree: false },
    },
  ])('$when', ({ limit, expected }) => {
    // Arrange
    const publicationsOfTheAccount = limit

    // Act
    const plan = toActivePlan(publicationsOfTheAccount)

    // Assert
    expect(plan).toEqual(expected)
  })
})
