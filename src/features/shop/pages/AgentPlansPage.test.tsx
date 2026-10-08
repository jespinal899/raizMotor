import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import AgentPlansPage from '@/features/shop/pages/AgentPlansPage'
import { BRAND } from '@/shared/constants/brand'
import { renderWithRouter } from '@/test/renderWithRouter'

const ROUTE = '/planes/agente-inmobiliario'
const PLAN_NAMES = ['Agente Pro', 'Agente Élite']

// El símbolo y la cifra van separados por un espacio de no separación.
const withPlainSpaces = (text: string) => text.replace(/\s+/g, ' ').trim()

const planCard = (name: string) =>
  screen.getByRole('heading', { level: 2, name }).closest('[data-slot="card"]') as HTMLElement
const textOfCard = (name: string) => withPlainSpaces(planCard(name).textContent ?? '')

describe('AgentPlansPage', () => {
  it('presenta los planes para agentes inmobiliarios y pone su título en la pestaña', () => {
    // Arrange
    const heading = 'Potencia tu carrera con DomusRaíz'
    const pageTitle = 'Planes para agentes inmobiliarios'

    // Act
    renderWithRouter(<AgentPlansPage />, { route: ROUTE })

    // Assert
    const title = screen.getByRole('heading', { level: 1, name: heading })
    expect(title.closest('header')).toHaveClass('text-center')
    expect(within(title).getByText('DomusRaíz')).toHaveClass('text-primary')
    expect(document.title).toBe(`${pageTitle} | ${BRAND.name}`)
  })

  it('presenta los nombres y beneficios vigentes de los dos planes', () => {
    // Arrange
    const expectedFeatures = [
      [
        'Hasta 25 propiedades activas',
        '1 usuario por agente inmobiliario',
      ],
      [
        'Hasta 100 propiedades activas',
        '2 usuarios por agente inmobiliario',
      ],
    ]

    // Act
    renderWithRouter(<AgentPlansPage />, { route: ROUTE })

    // Assert
    const plans = PLAN_NAMES.map((name) => screen.getByRole('heading', { level: 2, name }).textContent)
    const features = PLAN_NAMES.map((name) =>
      within(planCard(name))
        .getAllByRole('listitem')
        .map((item) => withPlainSpaces(item.textContent ?? '')),
    )
    expect(plans).toEqual(PLAN_NAMES)
    expect(features).toEqual(expectedFeatures)
    expect(
      screen.queryByText('Ideal para agentes independientes que están construyendo su cartera.'),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText('Para agentes de alto rendimiento que manejan un gran volumen de propiedades.'),
    ).not.toBeInTheDocument()
    expect(screen.queryByText('Panel avanzado y reportes detallados')).not.toBeInTheDocument()
    expect(screen.queryByText('Panel de administración de cartera')).not.toBeInTheDocument()
    expect(screen.queryByText('Reportes básicos de visitas')).not.toBeInTheDocument()
    expect(within(planCard('Agente Pro')).getByText('Hasta 25 propiedades').tagName).toBe('STRONG')
    expect(within(planCard('Agente Pro')).getByText('1 usuario').tagName).toBe('STRONG')
    expect(within(planCard('Agente Élite')).getByText('Hasta 100 propiedades').tagName).toBe('STRONG')
    expect(within(planCard('Agente Élite')).getByText('2 usuarios').tagName).toBe('STRONG')
  })

  it('presenta a la izquierda los beneficios de contratar con DomusRaíz', () => {
    // Arrange
    const expectedReasons = [
      'Soporte y atención al cliente 24/7.',
      'Administra todo desde un solo panel.',
      'Tu marca en cada propiedad, sin anuncios externos.',
    ]
    const expectedBenefits = [
      'Asesoría personalizada.',
      'Reportes y métricas de tus propiedades.',
      'Gestión centralizada de tus publicaciones.',
      'Mayor exposición para tus propiedades.',
      'Presencia profesional dentro de DomusRaíz.',
    ]

    // Act
    renderWithRouter(<AgentPlansPage />, { route: ROUTE })

    // Assert
    const reasons = screen.getByRole('complementary', { name: '¿Por qué contratar en DomusRaíz?' })
    const reasonItems = within(reasons)
      .getAllByRole('listitem')
      .slice(0, expectedReasons.length)
      .map((item) => withPlainSpaces(item.textContent ?? ''))
    const benefits = within(reasons).getByRole('heading', { level: 3, name: 'Con tu plan obtienes:' })
    const benefitItems = within(reasons)
      .getAllByRole('listitem')
      .slice(expectedReasons.length)
      .map((item) => withPlainSpaces(item.textContent ?? ''))

    expect(reasonItems).toEqual(expectedReasons)
    expect(benefits).toBeInTheDocument()
    expect(benefitItems).toEqual(expectedBenefits)
    expect(within(reasons).queryByText(/renovación automática/i)).not.toBeInTheDocument()
  })

  it('cada plan dice su precio mensual en lempiras, sin el impuesto, y su equivalente en dólares', () => {
    // Arrange: el precio y su equivalente van en dos líneas
    const expectedPrices = ['L 599/mes + ISV mensual', 'L 999/mes + ISV mensual']

    // Act
    renderWithRouter(<AgentPlansPage />, { route: ROUTE })

    // Assert
    PLAN_NAMES.forEach((name, index) => {
      expect(textOfCard(name)).toContain(expectedPrices[index])
      expect(within(planCard(name)).queryByText(/^≈/)).not.toBeInTheDocument()
    })
  })

  it('contratar un plan lleva al contacto indicando cuál', () => {
    // Arrange
    const expectedActions = [
      'Comenzar con Pro → /contacto?plan=agente-plan-1',
      'Comenzar con Élite → /contacto?plan=agente-plan-2',
    ]

    // Act
    renderWithRouter(<AgentPlansPage />, { route: ROUTE })

    // Assert
    const actions = PLAN_NAMES.map((name) => within(planCard(name)).getByRole('link')).map(
      (link) => `${link.textContent} → ${link.getAttribute('href')}`,
    )
    expect(actions).toEqual(expectedActions)
  })

  it('permite volver a todos los planes y pedir ayuda para elegir', () => {
    // Arrange: página de planes para agentes

    // Act
    renderWithRouter(<AgentPlansPage />, { route: ROUTE })

    // Assert
    expect(screen.getByRole('link', { name: 'Ver todos los planes' })).toHaveAttribute('href', '/planes')
    expect(screen.getByRole('link', { name: 'Escríbenos y te ayudamos a elegir' })).toHaveAttribute('href', '/contacto')
  })
})
