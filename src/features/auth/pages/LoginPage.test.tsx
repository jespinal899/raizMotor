import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import LoginPage from '@/features/auth/pages/LoginPage'
import { AuthUnavailableError, authService } from '@/features/auth/services/authService'
import { BRAND } from '@/shared/constants/brand'
import { renderWithRouter } from '@/test/renderWithRouter'

vi.mock('@/features/auth/services/authService', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/features/auth/services/authService')>()),
  authService: { login: vi.fn() },
}))

const login = vi.mocked(authService.login)

const LOGIN_PATH = '/iniciar-sesion'

const renderPage = () => renderWithRouter(<LoginPage />, { route: LOGIN_PATH, path: LOGIN_PATH })

const submitCredentials = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByRole('textbox', { name: 'Correo' }), 'ana@gmail.com')
  await user.type(screen.getByLabelText('Contraseña'), 'secreta123')
  await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }))
}

describe('LoginPage', () => {
  beforeEach(() => {
    login.mockReset()
  })

  it('muestra el título, el formulario y pone su título en la pestaña', async () => {
    // Arrange: visitante sin sesión

    // Act
    renderPage()

    // Assert
    expect(screen.getByRole('heading', { level: 1, name: 'Iniciar sesión' })).toBeInTheDocument()
    expect(screen.getByRole('form', { name: 'Formulario de inicio de sesión' })).toBeInTheDocument()
    await waitFor(() => expect(document.title).toBe(`Iniciar sesión | ${BRAND.name}`))
  })

  it('ofrece ayuda a través de la página de contacto', () => {
    // Arrange
    const helpLink = 'Contáctanos'

    // Act
    renderPage()

    // Assert
    expect(screen.getByRole('link', { name: helpLink })).toHaveAttribute('href', '/contacto')
  })

  it('inicia sesión con los datos escritos y lleva al inicio', async () => {
    // Arrange
    const user = userEvent.setup()
    login.mockResolvedValue(undefined)
    const { currentPath } = renderPage()

    // Act
    await submitCredentials(user)

    // Assert
    expect(login).toHaveBeenCalledExactlyOnceWith({ email: 'ana@gmail.com', password: 'secreta123', remember: false })
    await waitFor(() => expect(currentPath()).toBe('/'))
  })

  it('si no se pudo entrar, explica el motivo y se queda en la página', async () => {
    // Arrange
    const user = userEvent.setup()
    login.mockRejectedValue(new AuthUnavailableError())
    const { currentPath } = renderPage()

    // Act
    await submitCredentials(user)

    // Assert
    expect(await screen.findByRole('alert')).toHaveTextContent('El inicio de sesión aún no está disponible')
    expect(currentPath()).toBe(LOGIN_PATH)
  })
})
