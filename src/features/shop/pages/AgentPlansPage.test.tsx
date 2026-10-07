import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import AgentPlansPage from '@/features/shop/pages/AgentPlansPage'
import { BRAND } from '@/shared/constants/brand'
import { formatLempirasInDollars } from '@/shared/utils/format'
import { renderWithRouter } from '@/test/renderWithRouter'

const ROUTE = '/planes/agente-inmobiliario'
const PLAN_NAMES = ['Plan 1', 'Plan 2']

// El símbolo y la cifra van separados por un espacio de no separación.
const withPlainSpaces = (text: string) => text.replace(/\s+/g, ' ').trim()

const planCard = (name: string) =>
  screen.getByRole('heading', { level: 2, name }).closest('[data-slot="card"]') as HTMLElement
const textOfCard = (name: string) => withPlainSpaces(planCard(name).textContent ?? '')

describe('AgentPlansPage', () => {
  it('presenta los planes para agentes inmobiliarios y pone su título en la pestaña', () => {
    // Arrange
    const title = 'Planes para agentes inmobiliarios'

    // Act
    renderWithRouter(<AgentPlansPage />, { route: ROUTE })

    // Assert
    expect(screen.getByRole('heading', { level: 1, name: title })).toBeInTheDocument()
    expect(document.title).toBe(`${title} | ${BRAND.name}`)
  })

  it('ofrece los dos planes, cada uno con lo que incluye', () => {
    // Arrange
    const expectedFeatures = [
      ['Publica hasta 25 propiedades', '1 usuario por agente inmobiliario'],
      ['Publica hasta 100 propiedades', '2 usuarios por agente inmobiliario'],
    ]

    // Act
    renderWithRouter(<AgentPlansPage />, { route: ROUTE })

    // Assert
    const plans = screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent)
    const features = PLAN_NAMES.map((name) =>
      within(planCard(name))
        .getAllByRole('listitem')
        .map((item) => item.textContent),
    )
    expect(plans).toEqual(PLAN_NAMES)
    expect(features).toEqual(expectedFeatures)
  })

  it('cada plan dice su precio mensual en lempiras, sin el impuesto, y su equivalente en dólares', () => {
    // Arrange: el precio y su equivalente van en dos líneas
    const expectedPrices = [
      ['L 599 + ISV mensual', withPlainSpaces(`≈ ${formatLempirasInDollars(599)}`)],
      ['L 999 + ISV mensual', withPlainSpaces(`≈ ${formatLempirasInDollars(999)}`)],
    ]

    // Act
    renderWithRouter(<AgentPlansPage />, { route: ROUTE })

    // Assert
    PLAN_NAMES.forEach((name, index) => {
      const [inLempiras, inDollars] = expectedPrices[index]
      expect(textOfCard(name)).toContain(inLempiras)
      expect(textOfCard(name)).toContain(inDollars)
    })
  })

  it('contratar un plan lleva al contacto indicando cuál', () => {
    // Arrange
    const expectedActions = ['Contratar → /contacto?plan=agente-plan-1', 'Contratar → /contacto?plan=agente-plan-2']

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
