import { screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import BottomNav from '@/components/layout/BottomNav'
import { authService } from '@/features/auth/services/authService'
import { buildSessionUser } from '@/test/factories'
import { renderWithRouter } from '@/test/renderWithRouter'
import { sessionIs } from '@/test/session'

vi.mock('@/features/auth/services/authService', () => ({
  authService: { logout: vi.fn(), onSessionChange: vi.fn() },
}))

const tabs = () => within(screen.getByRole('navigation', { name: 'Navegación principal' }))
const tab = (name: string) => tabs().getByRole('link', { name })

describe('BottomNav', () => {
  beforeEach(() => {
    vi.mocked(authService.onSessionChange).mockReset()
  })

  it('tiene a mano lo principal: inicio, buscar, publicar, proyectos y la cuenta', () => {
    // Arrange
    sessionIs(null)

    // Act
    renderWithRouter(<BottomNav />)

    // Assert
    expect(tabs().getAllByRole('link').map((link) => link.textContent)).toEqual([
      'Inicio',
      'Buscar',
      'Publicar',
      'Proyectos',
      'Cuenta',
    ])
    expect(tab('Buscar')).toHaveAttribute('href', '/propiedades')
    expect(tab('Publicar')).toHaveAttribute('href', '/mi-plan')
    expect(tab('Proyectos')).toHaveAttribute('href', '/proyectos')
  })

  it('sin sesión la cuenta lleva a iniciar sesión', () => {
    // Arrange
    sessionIs(null)

    // Act
    renderWithRouter(<BottomNav />)

    // Assert
    expect(tab('Cuenta')).toHaveAttribute('href', '/iniciar-sesion')
  })

  it('con sesión la cuenta lleva a la cuenta de la persona', () => {
    // Arrange
    sessionIs(buildSessionUser())

    // Act
    renderWithRouter(<BottomNav />)

    // Assert
    expect(tab('Cuenta')).toHaveAttribute('href', '/mi-cuenta')
  })

  it('marca la pestaña de la página abierta, también dentro de una búsqueda por tipo', () => {
    // Arrange
    sessionIs(null)

    // Act
    renderWithRouter(<BottomNav />, { route: '/propiedades/casas' })

    // Assert
    expect(tab('Buscar')).toHaveAttribute('aria-current', 'page')
    expect(tab('Inicio')).not.toHaveAttribute('aria-current')
  })
})
