import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AccountPanel from '@/features/auth/components/AccountPanel'
import { authService } from '@/features/auth/services/authService'
import { buildSessionUser } from '@/test/factories'
import { renderWithRouter } from '@/test/renderWithRouter'

vi.mock('@/features/auth/services/authService', () => ({ authService: { logout: vi.fn() } }))

const logout = vi.mocked(authService.logout)

const USER = buildSessionUser({ firstName: 'Ana', lastName: 'Mejía', email: 'ana@gmail.com' })

const logoutButton = () => screen.getByRole('button', { name: 'Cerrar sesión' })

describe('AccountPanel', () => {
  beforeEach(() => {
    logout.mockReset()
  })

  it('dice de quién es la cuenta, con su nombre completo y su correo', () => {
    // Arrange: Ana tiene la sesión abierta

    // Act
    renderWithRouter(<AccountPanel user={USER} />)

    // Assert
    expect(screen.getByText('Ana Mejía')).toBeInTheDocument()
    expect(screen.getByText('ana@gmail.com')).toBeInTheDocument()
  })

  it('si la cuenta no guarda el nombre muestra el correo una sola vez', () => {
    // Arrange
    const nameless = buildSessionUser({ firstName: '', lastName: '', email: 'ana@gmail.com' })

    // Act
    renderWithRouter(<AccountPanel user={nameless} />)

    // Assert
    expect(screen.getAllByText('ana@gmail.com')).toHaveLength(1)
  })

  it('lleva a los anuncios de la cuenta, y avisa para que el menú que lo contiene se cierre', async () => {
    // Arrange
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    renderWithRouter(<AccountPanel user={USER} onNavigate={onNavigate} />)

    // Act
    await user.click(screen.getByRole('link', { name: 'Mis anuncios' }))

    // Assert
    expect(screen.getByRole('link', { name: 'Mis anuncios' })).toHaveAttribute('href', '/mis-anuncios')
    expect(onNavigate).toHaveBeenCalledOnce()
  })

  it('«Cerrar sesión» cierra la sesión', async () => {
    // Arrange
    const user = userEvent.setup()
    logout.mockResolvedValue(undefined)
    renderWithRouter(<AccountPanel user={USER} />)

    // Act
    await user.click(logoutButton())

    // Assert
    expect(logout).toHaveBeenCalledOnce()
  })

  it('si no se pudo cerrar la sesión lo avisa, y el botón sigue ahí para reintentar', async () => {
    // Arrange
    const user = userEvent.setup()
    logout.mockRejectedValue(new Error('sin conexión'))
    renderWithRouter(<AccountPanel user={USER} />)

    // Act
    await user.click(logoutButton())

    // Assert
    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos cerrar tu sesión. Inténtalo de nuevo.')
    expect(logoutButton()).toBeEnabled()
  })
})
