import { describe, expect, it } from 'vitest'
import { MAX_IMAGES } from '@/features/properties/utils/imageFiles'
import { MAX_FREE_PUBLICATIONS } from '@/features/properties/utils/publicationLimit'
import { PLANS } from '@/features/shop/data/plans.data'
import { ROUTES } from '@/shared/constants/routes'

const planById = (id: string) => PLANS.find((plan) => plan.id === id)!

describe('PLANS', () => {
  it('ofrece un plan para propietarios, agentes inmobiliarios e inmobiliarias, en ese orden', () => {
    // Arrange
    const expectedNames = ['Propietario', 'Agente inmobiliario', 'Inmobiliarias']

    // Act
    const names = PLANS.map((plan) => plan.name)

    // Assert
    expect(names).toEqual(expectedNames)
    expect(PLANS.map((plan) => plan.id)).toEqual(['propietario', 'agente', 'inmobiliaria'])
  })

  it('el plan Propietario es gratis y lleva al formulario de publicar', () => {
    // Arrange
    const owner = planById('propietario')

    // Act
    const { price, action } = owner

    // Assert
    expect(price).toEqual({ kind: 'free' })
    expect(action).toEqual({ label: 'Publicar gratis', to: ROUTES.publish })
  })

  it('el plan Propietario dice sus límites: una publicación y diez fotos, los mismos que aplica el formulario', () => {
    // Arrange
    const owner = planById('propietario')

    // Act
    const { features } = owner

    // Assert
    expect(MAX_FREE_PUBLICATIONS).toBe(1)
    expect(MAX_IMAGES).toBe(10)
    expect(features).toEqual(expect.arrayContaining(['1 publicación gratis', 'Hasta 10 fotos por publicación']))
  })

  it('los planes que aún no están definidos se anuncian sin precio y sin ventajas inventadas', () => {
    // Arrange
    const upcoming = [planById('agente'), planById('inmobiliaria')]

    // Act
    const summaries = upcoming.map(({ price, features }) => ({ price, features }))

    // Assert
    expect(summaries).toEqual([
      { price: { kind: 'upcoming' }, features: [] },
      { price: { kind: 'upcoming' }, features: [] },
    ])
  })

  it('los planes por definir envían al contacto indicando de qué plan se trata', () => {
    // Arrange
    const upcoming = PLANS.filter((plan) => plan.price.kind === 'upcoming')

    // Act
    const actions = upcoming.map((plan) => plan.action)

    // Assert
    expect(actions).toEqual([
      { label: 'Quiero saber más', to: '/contacto?plan=agente' },
      { label: 'Quiero saber más', to: '/contacto?plan=inmobiliaria' },
    ])
  })

  it('cada botón lleva a una página que existe', () => {
    // Arrange
    const knownPages: string[] = [ROUTES.publish, ROUTES.contact]

    // Act
    const destinations = PLANS.map((plan) => plan.action.to.split('?')[0])

    // Assert
    expect(knownPages).toEqual(expect.arrayContaining(destinations))
  })

  it('destaca un único plan: el que ya se puede usar', () => {
    // Arrange
    const isHighlighted = (plan: (typeof PLANS)[number]) => plan.highlighted === true

    // Act
    const highlighted = PLANS.filter(isHighlighted).map((plan) => plan.id)

    // Assert
    expect(highlighted).toEqual(['propietario'])
  })
})
