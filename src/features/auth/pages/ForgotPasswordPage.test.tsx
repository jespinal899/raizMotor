import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ForgotPasswordPage from '@/features/auth/pages/ForgotPasswordPage'
import { authService } from '@/features/auth/services/authService'
import { BRAND } from '@/shared/constants/brand'
import { renderWithRouter } from '@/test/renderWithRouter'

/** Si la compilación conoce el servicio de cuentas: cada prueba puede cambiarlo. */
const accounts = vi.hoisted(() => ({ available: true }))

vi.mock('@/features/auth/services/authService', () => ({
  get ACCOUNTS_AVAILABLE() {
    return accounts.available
  },
  authService: { requestPasswordReset: vi.fn() },
}))

const requestPasswordReset = vi.mocked(authService.requestPasswordReset)

const FORGOT_PATH = '/recuperar-contrasena'

const renderPage = () => renderWithRouter(<ForgotPasswordPage />, { route: FORGOT_PATH, path: FORGOT_PATH })

const emailField = () => screen.getByRole('textbox', { name: 'Correo' })
const submitButton = () => screen.getByRole('button', { name: /^Enviar enlace$|Enviando/ })

const askFor = async (email: string) => {
  const user = userEvent.setup()
  await user.type(emailField(), email)
  await user.click(submitButton())
}

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    accounts.available = true
    requestPasswordReset.mockReset()
  })

  it('pide el correo de la cuenta y pone su título en la pestaña', async () => {
    // Arrange
    const expectedTitle = `Recuperar contraseña | ${BRAND.name}`

    // Act
    renderPage()

    // Assert
    expect(screen.getByRole('heading', { level: 1, name: 'Recuperar contraseña' })).toBeInTheDocument()
    expect(screen.getByRole('form', { name: 'Formulario para recuperar la contraseña' })).toBeInTheDocument()
    expect(emailField()).toBeInTheDocument()
    await waitFor(() => expect(document.title).toBe(expectedTitle))
  })

  it('ofrece volver a iniciar sesión a quien recordó su contraseña', () => {
    // Arrange
    const loginPath = '/iniciar-sesion'

    // Act
    renderPage()

    // Assert
    expect(screen.getByRole('link', { name: 'Inicia sesión' })).toHaveAttribute('href', loginPath)
  })

  it('pide el enlace para el correo escrito y avisa de que revise su correo, sin decir si la cuenta existe', async () => {
    // Arrange
    requestPasswordReset.mockResolvedValue(undefined)
    renderPage()

    // Act
    await askFor('ana@gmail.com')

    // Assert
    const notice = await screen.findByRole('status')
    expect(requestPasswordReset).toHaveBeenCalledExactlyOnceWith('ana@gmail.com')
    expect(notice).toHaveTextContent('Revisa tu correo')
    expect(notice).toHaveTextContent('Si hay una cuenta con ana@gmail.com, te enviamos un enlace para elegir otra contraseña.')
  })

  it('después de pedirlo ya no muestra el formulario, para que no se envíe otra vez sin querer', async () => {
    // Arrange
    requestPasswordReset.mockResolvedValue(undefined)
    renderPage()

    // Act
    await askFor('ana@gmail.com')

    // Assert
    await screen.findByRole('status')
    expect(screen.queryByRole('form')).not.toBeInTheDocument()
  })

  it('no pide nada si lo escrito no tiene forma de correo, y dice cómo corregirlo', async () => {
    // Arrange
    renderPage()

    // Act
    await askFor('ana@')

    // Assert
    expect(requestPasswordReset).not.toHaveBeenCalled()
    expect(emailField()).toHaveAccessibleDescription('Revisa el correo: debe tener el formato nombre@dominio.com.')
  })

  it('si el enlace no se pudo enviar lo avisa y deja reintentar', async () => {
    // Arrange
    requestPasswordReset.mockRejectedValue(new Error('sin conexión'))
    renderPage()

    // Act
    await askFor('ana@gmail.com')

    // Assert
    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos enviar el enlace. Inténtalo de nuevo en unos minutos.')
    expect(submitButton()).toBeEnabled()
  })
})

describe('ForgotPasswordPage sin el servicio de cuentas', () => {
  beforeEach(() => {
    accounts.available = false
  })

  it('explica que recuperar la contraseña aún no está disponible, sin pedir un correo al que no se escribiría', () => {
    // Arrange: visitante que olvidó su contraseña

    // Act
    renderPage()

    // Assert
    expect(screen.getByRole('heading', { level: 1, name: 'Recuperar contraseña' })).toBeInTheDocument()
    expect(screen.getByText(/La recuperación de contraseña aún no está disponible/)).toBeInTheDocument()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })

  it('ofrece volver al inicio de sesión o pedir ayuda', () => {
    // Arrange
    const expectedLinks = ['Volver a iniciar sesión → /iniciar-sesion', 'Contáctanos → /contacto']

    // Act
    renderPage()

    // Assert
    const links = screen.getAllByRole('link').map((link) => `${link.textContent} → ${link.getAttribute('href')}`)
    expect(links).toEqual(expectedLinks)
  })
})
