import { describe, expect, it } from 'vitest'
import { MAX_FREE_PUBLICATIONS } from '@/features/properties/utils/publicationLimit'
import { AGENCY_PLANS, AGENT_PLANS, PLANS } from '@/features/shop/data/plans.data'
import { ROUTES, agencyPlanCheckoutPath, agentPlanCheckoutPath } from '@/shared/constants/routes'

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
      'Impulsa tu carrera. Publica tu cartera de propiedades, adminístrala desde «Mis publicaciones» y destaca tus anuncios en la portada.',
      'Para desarrolladoras y empresas con varias propiedades. Publica tus proyectos en preventa o en construcción, con sus modelos y renders, junto a tu cartera de propiedades.',
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
      { label: 'Publicar como inmobiliaria', to: '/planes/inmobiliarias' },
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
        name: 'Agente Pro',
        features: [
          { text: 'Hasta 25 propiedades activas', emphasized: 'Hasta 25 propiedades' },
          { text: 'Propiedades destacadas en la portada, por turnos', emphasized: 'destacadas en la portada' },
        ],
        monthlyPrice: 599,
      },
      {
        name: 'Agente Élite',
        features: [
          { text: 'Hasta 100 propiedades activas', emphasized: 'Hasta 100 propiedades' },
          { text: 'Propiedades destacadas en la portada, por turnos', emphasized: 'destacadas en la portada' },
        ],
        monthlyPrice: 999,
      },
    ]

    // Act
    const plans = AGENT_PLANS.map(({ name, features, monthlyPrice }) => ({
      name,
      features,
      monthlyPrice,
    }))

    // Assert
    expect(plans).toEqual(expectedPlans)
  })

  it('cada plan admite publicadas las propiedades que promete su tarjeta', () => {
    // Arrange
    const expectedLimits = [25, 100]

    // Act
    const limits = AGENT_PLANS.map((plan) => plan.maxPublications)

    // Assert
    expect(limits).toEqual(expectedLimits)
    expect(AGENT_PLANS.every((plan) => plan.features[0].text === `Hasta ${plan.maxPublications} propiedades activas`)).toBe(true)
  })

  it('cada tramo en negrita forma parte del texto de su punto: si no, la negrita se perdería sin avisar', () => {
    // Arrange
    const features = AGENT_PLANS.flatMap((plan) => plan.features)

    // Act
    const misplaced = features.filter(({ text, emphasized }) => emphasized !== undefined && !text.includes(emphasized))

    // Assert
    expect(misplaced).toEqual([])
  })

  it('el botón de cada plan abre su página de contratación, que pide una cuenta', () => {
    // Arrange
    const expectedActions = [
      { label: 'Comenzar con Pro', to: '/planes/agente-inmobiliario/contratar/agente-plan-1', requiresAccount: true },
      { label: 'Comenzar con Élite', to: '/planes/agente-inmobiliario/contratar/agente-plan-2', requiresAccount: true },
    ]

    // Act
    const actions = AGENT_PLANS.map((plan) => plan.action)

    // Assert
    expect(actions).toEqual(expectedActions)
  })
})

describe('todos los planes', () => {
  const allPlans = [...PLANS, ...AGENT_PLANS, ...AGENCY_PLANS]

  it('ningún identificador se repite: el contacto distingue por él sobre qué plan se consulta', () => {
    // Arrange
    const total = allPlans.length

    // Act
    const ids = new Set(allPlans.map((plan) => plan.id))

    // Assert
    expect(ids.size).toBe(total)
  })

  it('elegir un plan pide una cuenta; abrir la lista de planes de agente o de inmobiliaria, no', () => {
    // Arrange
    const listsOfPlans: string[] = [ROUTES.agentPlans, ROUTES.agencyPlans]

    // Act
    const withoutAccount = allPlans.filter((plan) => !plan.action.requiresAccount).map((plan) => plan.action.to)

    // Assert
    expect(withoutAccount).toEqual(listsOfPlans)
  })

  it('cada botón lleva a una página que existe', () => {
    // Arrange
    const knownPages: string[] = [
      ROUTES.publish,
      ROUTES.agentPlans,
      ROUTES.agencyPlans,
      ROUTES.contact,
      ...AGENT_PLANS.map((plan) => agentPlanCheckoutPath(plan.id)),
      ...AGENCY_PLANS.map((plan) => agencyPlanCheckoutPath(plan.id)),
    ]

    // Act
    const destinations = allPlans.map((plan) => plan.action.to.split('?')[0])

    // Assert
    expect(knownPages).toEqual(expect.arrayContaining(destinations))
  })
})

describe('AGENCY_PLANS', () => {
  it('ofrece tres planes de inmobiliaria, de menos a más proyectos y propiedades', () => {
    // Arrange
    const expected = [
      ['Inmobiliaria Inicial', 1, 50, 1999],
      ['Inmobiliaria Plus', 3, 150, 3999],
      ['Inmobiliaria Corporativa', 10, 500, 6999],
    ]

    // Act
    const plans = AGENCY_PLANS.map(({ name, maxProjects, maxPublications, monthlyPrice }) => [
      name,
      maxProjects,
      maxPublications,
      monthlyPrice,
    ])

    // Assert
    expect(plans).toEqual(expected)
  })

  it('cada tarjeta promete los proyectos y las propiedades que el plan da a la cuenta', () => {
    // Arrange: los planes de inmobiliaria

    // Act
    const promises = AGENCY_PLANS.map(({ features }) => features.map(({ text }) => text).join(' · '))

    // Assert
    expect(promises).toEqual([
      expect.stringContaining('1 proyecto activo · Hasta 50 propiedades activas'),
      expect.stringContaining('Hasta 3 proyectos activos · Hasta 150 propiedades activas'),
      expect.stringContaining('Hasta 10 proyectos activos · Hasta 500 propiedades activas'),
    ])
  })

  it('los planes de agente no admiten proyectos', () => {
    // Arrange: los planes de agente

    // Act
    const projects = AGENT_PLANS.map(({ maxProjects }) => maxProjects)

    // Assert
    expect(projects).toEqual([0, 0])
  })
})
