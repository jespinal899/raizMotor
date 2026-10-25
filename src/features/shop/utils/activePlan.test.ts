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

describe('toActivePlan, con los proyectos que admite la cuenta', () => {
  it.each([
    { when: 'sin proyectos, una publicación sigue siendo Propietario', limit: 1, projects: 0, expected: { name: 'Propietario', isFree: true } },
    { when: 'veinticinco sin proyectos son Agente Pro', limit: 25, projects: 0, expected: { name: 'Agente Pro', isFree: false } },
    { when: 'cincuenta con un proyecto son Inmobiliaria Inicial', limit: 50, projects: 1, expected: { name: 'Inmobiliaria Inicial', isFree: false } },
    { when: 'una publicación con proyectos es un plan a medida', limit: 1, projects: 2, expected: { name: 'Plan a medida', isFree: false } },
    { when: 'cincuenta con dos proyectos no son ningún plan en venta', limit: 50, projects: 2, expected: { name: 'Plan a medida', isFree: false } },
  ])('$when', ({ limit, projects, expected }) => {
    // Arrange
    const projectsOfTheAccount = projects

    // Act
    const plan = toActivePlan(limit, projectsOfTheAccount)

    // Assert
    expect(plan).toEqual(expected)
  })
})
