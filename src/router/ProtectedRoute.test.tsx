import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { authService } from '@/features/auth/services/authService'
import ProtectedRoute from '@/router/ProtectedRoute'
import { buildSessionUser } from '@/test/factories'
import { renderWithRouter } from '@/test/renderWithRouter'
import { sessionIs } from '@/test/session'

/** Si la compilación conoce el servicio de cuentas: cada prueba puede cambiarlo. */
const accounts = vi.hoisted(() => ({ available: true }))

vi.mock('@/features/auth/services/authService', () => ({
  get ACCOUNTS_AVAILABLE() {
    return accounts.available
  },
  authService: { onSessionChange: vi.fn() },
}))

const TITLE = 'Inicia sesión para publicar'
const CONTENT = 'Contenido reservado'

const renderRoute = () =>
  renderWithRouter(
    <ProtectedRoute title={TITLE} description="Tu anuncio queda a nombre de tu cuenta.">
      <p>{CONTENT}</p>
    </ProtectedRoute>,
    { route: '/publicar', path: '/publicar' },
  )

describe('ProtectedRoute', () => {
  beforeEach(() => {
    accounts.available = true
    vi.mocked(authService.onSessionChange).mockReset()
  })

  it('a quien tiene la sesión abierta le muestra la página', () => {
    // Arrange
    sessionIs(buildSessionUser())

    // Act
    renderRoute()

    // Assert
    expect(screen.getByText(CONTENT)).toBeInTheDocument()
  })

  it('a quien no la tiene le pide iniciarla, en lugar de la página', () => {
    // Arrange
    sessionIs(null)

    // Act
    renderRoute()

    // Assert
    expect(screen.getByRole('heading', { level: 1, name: TITLE })).toBeInTheDocument()
    expect(screen.getByText('Tu anuncio queda a nombre de tu cuenta.')).toBeInTheDocument()
    expect(screen.queryByText(CONTENT)).not.toBeInTheDocument()
  })

  it('el inicio de sesión que ofrece vuelve después a esta misma página', () => {
    // Arrange
    sessionIs(null)
    const expectedLinks = ['Iniciar sesión → /iniciar-sesion?volver=%2Fpublicar', 'Crear una cuenta → /registro']

    // Act
    renderRoute()

    // Assert
    const links = screen.getAllByRole('link').map((link) => `${link.textContent} → ${link.getAttribute('href')}`)
    expect(links).toEqual(expectedLinks)
  })

  it('mientras no se sabe si hay sesión no enseña la página ni pide nada', () => {
    // Arrange: el servicio aún no ha dicho quién tiene la sesión

    // Act
    renderRoute()

    // Assert
    expect(screen.getByLabelText('Cargando página')).toBeInTheDocument()
    expect(screen.queryByText(CONTENT)).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: TITLE })).not.toBeInTheDocument()
  })

  it('sin servicio de cuentas no exige sesión: no habría cómo iniciarla', () => {
    // Arrange
    accounts.available = false
    sessionIs(null)

    // Act
    renderRoute()

    // Assert
    expect(screen.getByText(CONTENT)).toBeInTheDocument()
  })
})
