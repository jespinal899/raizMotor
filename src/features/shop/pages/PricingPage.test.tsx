import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PricingPage from '@/features/shop/pages/PricingPage'
import { BRAND } from '@/shared/constants/brand'
import { renderWithRouter } from '@/test/renderWithRouter'

const PLAN_NAMES = ['Propietario', 'Agente inmobiliario', 'Inmobiliarias']

const planCard = (name: string) =>
  screen.getByRole('heading', { level: 2, name }).closest('[data-slot="card"]') as HTMLElement

describe('PricingPage', () => {
  it('invita a publicar con su título y su subtítulo', () => {
    // Arrange
    const subtitle =
      'Elige el plan que mejor se adapte a tus necesidades. Empieza gratis hoy mismo y llega a miles de personas.'

    // Act
    renderWithRouter(<PricingPage />, { route: '/planes' })

    // Assert
    expect(screen.getByRole('heading', { level: 1, name: 'Publica tu propiedad en simples pasos' })).toBeInTheDocument()
    expect(screen.getByText(subtitle)).toBeInTheDocument()
  })

  it('el título va centrado y resalta "simples pasos" en el color de la marca', () => {
    // Arrange: página de planes

    // Act
    renderWithRouter(<PricingPage />, { route: '/planes' })

    // Assert
    const title = screen.getByRole('heading', { level: 1 })
    expect(title.closest('header')).toHaveClass('text-center')
    expect(within(title).getByText('simples pasos')).toHaveClass('text-primary')
  })

  it('presenta los tres planes, cada uno con su encabezado', () => {
    // Arrange: página de planes

    // Act
    renderWithRouter(<PricingPage />, { route: '/planes' })

    // Assert
    const plans = screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent)
    expect(plans).toEqual(PLAN_NAMES)
  })

  it('cada plan explica para quién es', () => {
    // Arrange
    const expectedTexts = [/^Vende o arrienda rápido\./, /^Impulsa tu carrera\./, /^Para empresas con un equipo/]

    // Act
    renderWithRouter(<PricingPage />, { route: '/planes' })

    // Assert
    PLAN_NAMES.forEach((name, index) => {
      expect(within(planCard(name)).getByText(expectedTexts[index])).toBeInTheDocument()
    })
  })

  it('cada plan ofrece su siguiente paso', () => {
    // Arrange
    const expectedActions = [
      'Publicar como propietario → /publicar',
      'Publicar como inmobiliario → /planes/agente-inmobiliario',
      'Publicar como inmobiliaria → /contacto?plan=inmobiliaria',
    ]

    // Act
    renderWithRouter(<PricingPage />, { route: '/planes' })

    // Assert
    const actions = PLAN_NAMES.map((name) => within(planCard(name)).getByRole('link')).map(
      (link) => `${link.textContent} → ${link.getAttribute('href')}`,
    )
    expect(actions).toEqual(expectedActions)
  })

  it('cada tarjeta tiene el título azul y un botón azul con texto blanco', () => {
    // Arrange: página con los tres planes

    // Act
    renderWithRouter(<PricingPage />, { route: '/planes' })

    // Assert
    for (const name of PLAN_NAMES) {
      const card = planCard(name)
      expect(within(card).getByRole('heading', { level: 2, name })).toHaveClass('text-primary')

      const action = within(card).getByRole('link')
      expect(action).toHaveClass('bg-primary', 'text-primary-foreground')
      expect(action).not.toHaveClass('bg-transparent', 'text-primary')
    }
  })

  it('cada botón incluye un icono lineal y un hover azul suave con elevación', () => {
    // Arrange: página con los tres planes

    // Act
    renderWithRouter(<PricingPage />, { route: '/planes' })

    // Assert
    for (const name of PLAN_NAMES) {
      const action = within(planCard(name)).getByRole('link')
      const icon = action.querySelector('svg')

      expect(icon).toBeInTheDocument()
      expect(icon).toHaveAttribute('fill', 'none')
      expect(icon).toHaveAttribute('stroke', 'currentColor')
      expect(action).toHaveClass('hover:bg-primary/80', 'hover:-translate-y-0.5', 'hover:shadow-md')
    }
  })

  it('las tarjetas llevan solo el nombre, el texto y el botón: sin precio, insignia ni lista', () => {
    // Arrange
    const removedTexts = ['Gratis', 'Próximamente', 'Recomendado', /Estamos definiendo este plan/]

    // Act
    renderWithRouter(<PricingPage />, { route: '/planes' })

    // Assert
    for (const text of removedTexts) expect(screen.queryByText(text)).not.toBeInTheDocument()
    for (const name of PLAN_NAMES) expect(within(planCard(name)).queryByRole('list')).not.toBeInTheDocument()
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
