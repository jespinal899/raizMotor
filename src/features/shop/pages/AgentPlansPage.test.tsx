import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import AgentPlansPage from '@/features/shop/pages/AgentPlansPage'
import { BRAND } from '@/shared/constants/brand'
import { renderWithRouter } from '@/test/renderWithRouter'

const ROUTE = '/planes/agente-inmobiliario'
const PLAN_NAMES = ['Agente Pro', 'Agente Élite']
const REASONS_TITLE = `¿Por qué contratar en ${BRAND.name}?`

// El símbolo y la cifra van separados por un espacio de no separación.
const withPlainSpaces = (text: string) => text.replace(/\s+/g, ' ').trim()

const planCard = (name: string) =>
  screen.getByRole('heading', { level: 2, name }).closest('[data-slot="card"]') as HTMLElement
const textOfCard = (name: string) => withPlainSpaces(planCard(name).textContent ?? '')
const reasonsPanel = () => screen.getByRole('complementary', { name: REASONS_TITLE })
const itemsOf = (list: HTMLElement) =>
  within(list)
    .getAllByRole('listitem')
    .map((item) => withPlainSpaces(item.textContent ?? ''))

describe('AgentPlansPage', () => {
  it('presenta los planes para agentes inmobiliarios y pone su título en la pestaña', () => {
    // Arrange
    const heading = `Potencia tu carrera con ${BRAND.name}`
    const pageTitle = 'Planes para agentes inmobiliarios'

    // Act
    renderWithRouter(<AgentPlansPage />, { route: ROUTE })

    // Assert
    const title = screen.getByRole('heading', { level: 1, name: heading })
    expect(title.closest('header')).toHaveClass('text-center')
    expect(within(title).getByText(BRAND.name)).toHaveClass('text-primary')
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

  it('presenta los motivos para contratar y lo que se obtiene con un plan, cada uno en su lista', () => {
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
      `Presencia profesional dentro de ${BRAND.name}.`,
    ]

    // Act
    renderWithRouter(<AgentPlansPage />, { route: ROUTE })

    // Assert
    const reasons = reasonsPanel()
    const [reasonList, benefitList] = within(reasons).getAllByRole('list')
    expect(itemsOf(reasonList)).toEqual(expectedReasons)
    expect(within(reasons).getByRole('heading', { level: 3, name: 'Con tu plan obtienes:' })).toBeInTheDocument()
    expect(itemsOf(benefitList)).toEqual(expectedBenefits)
    expect(within(reasons).queryByText(/renovación automática/i)).not.toBeInTheDocument()
  })

  it('el título del panel resalta solo el nombre de la marca: los dos signos de interrogación van como el texto', () => {
    // Arrange: página de planes para agentes

    // Act
    renderWithRouter(<AgentPlansPage />, { route: ROUTE })

    // Assert
    const title = within(reasonsPanel()).getByRole('heading', { level: 2, name: REASONS_TITLE })
    expect(within(title).getByText(BRAND.name)).toHaveClass('text-primary')
  })

  it('los planes van antes que los motivos en el documento, para que en un teléfono se vean primero', () => {
    // Arrange: página de planes para agentes

    // Act
    renderWithRouter(<AgentPlansPage />, { route: ROUTE })

    // Assert
    const firstPlan = planCard(PLAN_NAMES[0])
    const reasonsComeLater = firstPlan.compareDocumentPosition(reasonsPanel()) & Node.DOCUMENT_POSITION_FOLLOWING
    expect(reasonsComeLater).toBeTruthy()
  })

  it('en pantallas anchas el panel de motivos pasa a la primera columna, a la izquierda de los planes', () => {
    // Arrange: página de planes para agentes

    // Act
    renderWithRouter(<AgentPlansPage />, { route: ROUTE })

    // Assert
    expect(reasonsPanel()).toHaveClass('xl:order-first')
  })

  it('cada plan dice su precio mensual en lempiras, sin el impuesto y sin equivalente en otra moneda', () => {
    // Arrange
    const expectedPrices = ['L 599/mes + ISV', 'L 999/mes + ISV']

    // Act
    renderWithRouter(<AgentPlansPage />, { route: ROUTE })

    // Assert
    PLAN_NAMES.forEach((name, index) => {
      expect(textOfCard(name)).toContain(expectedPrices[index])
      expect(textOfCard(name)).not.toContain('mensual')
      expect(within(planCard(name)).queryByText(/^≈/)).not.toBeInTheDocument()
    })
  })

  it('el botón de cada plan lleva a su página de contratación', () => {
    // Arrange
    const expectedActions = [
      'Comenzar con Pro → /planes/agente-inmobiliario/contratar/agente-plan-1',
      'Comenzar con Élite → /planes/agente-inmobiliario/contratar/agente-plan-2',
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
