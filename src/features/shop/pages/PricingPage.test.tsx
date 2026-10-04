import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PricingPage from '@/features/shop/pages/PricingPage'
import { BRAND } from '@/shared/constants/brand'
import { renderWithRouter } from '@/test/renderWithRouter'

describe('PricingPage', () => {
  it('presenta los tres planes, cada uno con su encabezado', () => {
    // Arrange
    const expectedPlans = ['Particular', 'Inmobiliaria', 'Constructora']

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
      'Solicitar este plan → /contacto?plan=inmobiliaria',
      'Hablar con ventas → /contacto?plan=constructora',
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

  it('ofrece ayuda para elegir y pone su título en la pestaña', () => {
    // Arrange
    const helpLink = 'Escríbenos y te ayudamos a elegir'

    // Act
    renderWithRouter(<PricingPage />, { route: '/planes' })

    // Assert
    expect(screen.getByRole('link', { name: helpLink })).toHaveAttribute('href', '/contacto')
    expect(document.title).toBe(`Planes | ${BRAND.name}`)
  })
})
