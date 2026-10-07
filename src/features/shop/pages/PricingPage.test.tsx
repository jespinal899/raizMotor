import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PricingPage from '@/features/shop/pages/PricingPage'
import { BRAND } from '@/shared/constants/brand'
import { renderWithRouter } from '@/test/renderWithRouter'

const planCard = (name: string) =>
  screen.getByRole('heading', { level: 2, name }).closest('[data-slot="card"]') as HTMLElement

describe('PricingPage', () => {
  it('presenta los tres planes, cada uno con su encabezado', () => {
    // Arrange
    const expectedPlans = ['Propietario', 'Agente inmobiliario', 'Inmobiliarias']

    // Act
    renderWithRouter(<PricingPage />, { route: '/planes' })

    // Assert
    expect(screen.getByRole('heading', { level: 1, name: 'Planes' })).toBeInTheDocument()
    const plans = screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent)
    expect(plans).toEqual(expectedPlans)
  })

  it('cada plan ofrece su siguiente paso', () => {
    // Arrange
    const expectedActions = [
      'Publicar gratis → /publicar',
      'Quiero saber más → /contacto?plan=agente',
      'Quiero saber más → /contacto?plan=inmobiliaria',
    ]

    // Act
    renderWithRouter(<PricingPage />, { route: '/planes' })

    // Assert
    const actions = screen
      .getAllByRole('link')
      .slice(0, 3)
      .map((link) => `${link.textContent} → ${link.getAttribute('href')}`)
    expect(actions).toEqual(expectedActions)
  })

  it('el plan Propietario es gratis y dice que incluye una publicación con hasta diez fotos', () => {
    // Arrange: página de planes

    // Act
    renderWithRouter(<PricingPage />, { route: '/planes' })

    // Assert
    const owner = planCard('Propietario')
    expect(within(owner).getByText('Gratis')).toBeInTheDocument()
    expect(within(owner).getByText('1 publicación gratis')).toBeInTheDocument()
    expect(within(owner).getByText('Hasta 10 fotos por publicación')).toBeInTheDocument()
  })

  it('los planes de agentes e inmobiliarias se anuncian como "Próximamente", sin precio', () => {
    // Arrange
    const upcomingPlans = ['Agente inmobiliario', 'Inmobiliarias']

    // Act
    renderWithRouter(<PricingPage />, { route: '/planes' })

    // Assert
    for (const name of upcomingPlans) {
      expect(within(planCard(name)).getByText('Próximamente')).toBeInTheDocument()
      expect(within(planCard(name)).queryByText(/\$/)).not.toBeInTheDocument()
      expect(within(planCard(name)).queryByRole('list')).not.toBeInTheDocument()
    }
  })

  it('ofrece ayuda para elegir y pone su título en la pestaña', () => {
    // Arrange
    const helpLink = 'Escríbenos y te ayudamos a elegir'

    // Act
    renderWithRouter(<PricingPage />, { route: '/planes' })

    // Assert
    expect(screen.getByRole('link', { name: helpLink })).toHaveAttribute('href', '/contacto')
    expect(screen.getByText(/¿No sabes cuál te conviene\?/)).toHaveTextContent(`¿No sabes cuál te conviene? ${helpLink}`)
    expect(document.title).toBe(`Planes | ${BRAND.name}`)
  })
})
