import { screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Navbar from '@/components/layout/Navbar'
import { authService } from '@/features/auth/services/authService'
import { buildSessionUser } from '@/test/factories'
import { renderWithRouter } from '@/test/renderWithRouter'
import { sessionIs } from '@/test/session'

vi.mock('@/features/auth/services/authService', () => ({
  authService: { logout: vi.fn(), onSessionChange: vi.fn() },
}))

const bar = () => within(screen.getByRole('banner'))
const loginLink = () => bar().queryByRole('link', { name: 'Iniciar sesión' })
const accountButton = () => bar().queryByRole('button', { name: 'Cuenta de Ana' })

describe('Navbar', () => {
  beforeEach(() => {
    vi.mocked(authService.onSessionChange).mockReset()
  })

  it('sin sesión ofrece iniciar sesión', () => {
    // Arrange
    sessionIs(null)

    // Act
    renderWithRouter(<Navbar />)

    // Assert
    expect(loginLink()).toHaveAttribute('href', '/iniciar-sesion')
    expect(accountButton()).not.toBeInTheDocument()
  })

  it('con sesión muestra la cuenta de la persona en lugar de «Iniciar sesión»', () => {
    // Arrange
    sessionIs(buildSessionUser({ firstName: 'Ana' }))

    // Act
    renderWithRouter(<Navbar />)

    // Assert
    expect(accountButton()).toBeInTheDocument()
    expect(loginLink()).not.toBeInTheDocument()
  })

  it('mientras no se sabe si hay sesión no muestra ni una cosa ni la otra', () => {
    // Arrange: el servicio aún no ha dicho quién tiene la sesión

    // Act
    renderWithRouter(<Navbar />)

    // Assert
    expect(loginLink()).not.toBeInTheDocument()
    expect(accountButton()).not.toBeInTheDocument()
  })

  it('ofrece publicar haya o no sesión', () => {
    // Arrange
    sessionIs(buildSessionUser())

    // Act
    renderWithRouter(<Navbar />)

    // Assert
    expect(bar().getByRole('link', { name: 'Publicar' })).toHaveAttribute('href', '/planes')
  })
})
