import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AccountPanel from '@/features/auth/components/AccountPanel'
import { authService } from '@/features/auth/services/authService'
import { buildSessionUser } from '@/test/factories'

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
    render(<AccountPanel user={USER} />)

    // Assert
    expect(screen.getByText('Ana Mejía')).toBeInTheDocument()
    expect(screen.getByText('ana@gmail.com')).toBeInTheDocument()
  })

  it('si la cuenta no guarda el nombre muestra el correo una sola vez', () => {
    // Arrange
    const nameless = buildSessionUser({ firstName: '', lastName: '', email: 'ana@gmail.com' })

    // Act
    render(<AccountPanel user={nameless} />)

    // Assert
    expect(screen.getAllByText('ana@gmail.com')).toHaveLength(1)
  })

  it('«Cerrar sesión» cierra la sesión', async () => {
    // Arrange
    const user = userEvent.setup()
    logout.mockResolvedValue(undefined)
    render(<AccountPanel user={USER} />)

    // Act
    await user.click(logoutButton())

    // Assert
    expect(logout).toHaveBeenCalledOnce()
  })

  it('si no se pudo cerrar la sesión lo avisa, y el botón sigue ahí para reintentar', async () => {
    // Arrange
    const user = userEvent.setup()
    logout.mockRejectedValue(new Error('sin conexión'))
    render(<AccountPanel user={USER} />)

    // Act
    await user.click(logoutButton())

    // Assert
    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos cerrar tu sesión. Inténtalo de nuevo.')
    expect(logoutButton()).toBeEnabled()
  })
})
