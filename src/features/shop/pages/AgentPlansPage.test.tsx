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

  it('presenta los nombres, descripciones y beneficios de los dos planes', () => {
    // Arrange
    const expectedFeatures = [
      [
        'Hasta 25 propiedades activas',
        '1 usuario por agente inmobiliario',
        'Panel de administración de cartera',
        'Reportes básicos de visitas',
      ],
      [
        'Hasta 100 propiedades activas',
        '2 usuarios por agente inmobiliario',
        'Panel avanzado y reportes detallados',
      ],
    ]
    const expectedDescriptions = [
      'Ideal para agentes independientes que están construyendo su cartera.',
      'Para agentes de alto rendimiento que manejan un gran volumen de propiedades.',
    ]

    // Act
    renderWithRouter(<AgentPlansPage />, { route: ROUTE })

    // Assert
    const plans = screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent)
    const features = PLAN_NAMES.map((name) =>
      within(planCard(name))
        .getAllByRole('listitem')
        .map((item) => withPlainSpaces(item.textContent ?? '')),
    )
    const descriptions = PLAN_NAMES.map((name) =>
      within(planCard(name)).getByText(expectedDescriptions[PLAN_NAMES.indexOf(name)]),
    )
    expect(plans).toEqual(PLAN_NAMES)
    expect(features).toEqual(expectedFeatures)
    expect(descriptions).toHaveLength(2)
    expect(within(planCard('Agente Pro')).getByText('Hasta 25 propiedades').tagName).toBe('STRONG')
    expect(within(planCard('Agente Pro')).getByText('1 usuario').tagName).toBe('STRONG')
    expect(within(planCard('Agente Élite')).getByText('Hasta 100 propiedades').tagName).toBe('STRONG')
    expect(within(planCard('Agente Élite')).getByText('2 usuarios').tagName).toBe('STRONG')
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
