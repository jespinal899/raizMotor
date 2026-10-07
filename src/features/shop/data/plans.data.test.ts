import { describe, expect, it } from 'vitest'
import { MAX_FREE_PUBLICATIONS } from '@/features/properties/utils/publicationLimit'
import { AGENT_PLANS, PLANS } from '@/features/shop/data/plans.data'
import { ROUTES } from '@/shared/constants/routes'

describe('PLANS', () => {
  it('ofrece publicar como propietario, agente inmobiliario o inmobiliaria, en ese orden', () => {
    // Arrange
    const expectedNames = ['Propietario', 'Agente inmobiliario', 'Inmobiliarias']

    // Act
    const names = PLANS.map((plan) => plan.name)

    // Assert
    expect(names).toEqual(expectedNames)
    expect(PLANS.map((plan) => plan.id)).toEqual(['propietario', 'agente', 'inmobiliaria'])
  })

  it('cada plan se presenta con su texto', () => {
    // Arrange
    const expectedDescriptions = [
      'Vende o arrienda rápido. Publica 1 propiedad gratis y aprovecha nuestra alta visualización para llegar a miles de interesados sin comisiones.',
      'Impulsa tu carrera. Publica tu cartera de propiedades y accede a un panel exclusivo para administrar, dar seguimiento y ver reportes de tus anuncios. La herramienta definitiva para cerrar más ventas.',
      'Para empresas con un equipo que gestiona varias propiedades.',
    ]

    // Act
    const descriptions = PLANS.map((plan) => plan.description)

    // Assert
    expect(descriptions).toEqual(expectedDescriptions)
  })

  it('el plan Propietario promete las mismas publicaciones gratis que admite el formulario', () => {
    // Arrange
    const owner = PLANS.find((plan) => plan.id === 'propietario')!

    // Act
    const { description } = owner

    // Assert
    expect(MAX_FREE_PUBLICATIONS).toBe(1)
    expect(description).toContain(`Publica ${MAX_FREE_PUBLICATIONS} propiedad gratis`)
  })

  it('cada botón dice como quién se publica y lleva a su siguiente paso', () => {
    // Arrange
    const expectedActions = [
      { label: 'Publicar como propietario', to: ROUTES.publish },
      { label: 'Publicar como inmobiliario', to: ROUTES.agentPlans },
      { label: 'Publicar como inmobiliaria', to: '/contacto?plan=inmobiliaria' },
    ]

    // Act
    const actions = PLANS.map(({ action: { label, to } }) => ({ label, to }))

    // Assert
    expect(actions).toEqual(expectedActions)
  })
})

describe('AGENT_PLANS', () => {
  it('ofrece dos planes mensuales para agentes, del más pequeño al más grande', () => {
    // Arrange
    const expectedPlans = [
      {
        name: 'Plan 1',
        features: ['Publica hasta 25 propiedades', '1 usuario por agente inmobiliario'],
        monthlyPrice: 599,
      },
      {
        name: 'Plan 2',
        features: ['Publica hasta 100 propiedades', '2 usuarios por agente inmobiliario'],
        monthlyPrice: 999,
      },
    ]

    // Act
    const plans = AGENT_PLANS.map(({ name, features, monthlyPrice }) => ({ name, features, monthlyPrice }))

    // Assert
    expect(plans).toEqual(expectedPlans)
  })

  it('contratar un plan abre el contacto indicando cuál: todavía no hay pagos en línea', () => {
    // Arrange
    const expectedActions = [
      { label: 'Contratar', to: '/contacto?plan=agente-plan-1' },
      { label: 'Contratar', to: '/contacto?plan=agente-plan-2' },
    ]

    // Act
    const actions = AGENT_PLANS.map((plan) => plan.action)

    // Assert
    expect(actions).toEqual(expectedActions)
  })
})

describe('todos los planes', () => {
  const allPlans = [...PLANS, ...AGENT_PLANS]

  it('ningún identificador se repite: el contacto distingue por él sobre qué plan se consulta', () => {
    // Arrange
    const total = allPlans.length

    // Act
    const ids = new Set(allPlans.map((plan) => plan.id))

    // Assert
    expect(ids.size).toBe(total)
  })

  it('cada botón lleva a una página que existe', () => {
    // Arrange
    const knownPages: string[] = [ROUTES.publish, ROUTES.agentPlans, ROUTES.contact]

    // Act
    const destinations = allPlans.map((plan) => plan.action.to.split('?')[0])

    // Assert
    expect(knownPages).toEqual(expect.arrayContaining(destinations))
  })
})
