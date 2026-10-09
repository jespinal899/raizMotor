import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import RegisterPage from '@/features/auth/pages/RegisterPage'
import { AuthUnavailableError, RegistrationUnavailableError } from '@/features/auth/services/authErrors'
import { authService } from '@/features/auth/services/authService'
import { BRAND } from '@/shared/constants/brand'
import { buildRegistration } from '@/test/factories'
import { fillRegistrationForm, registrationForm } from '@/test/registrationForm'
import { renderWithRouter } from '@/test/renderWithRouter'
import { anyOperationKey } from '@/test/operationKey'

/** Si la compilación conoce el servicio de cuentas: cada prueba puede cambiarlo. */
const accounts = vi.hoisted(() => ({ available: true }))

vi.mock('@/features/auth/services/authService', () => ({
  get ACCOUNTS_AVAILABLE() {
    return accounts.available
  },
  authService: { register: vi.fn(), loginWithGoogle: vi.fn() },
}))

const register = vi.mocked(authService.register)
const loginWithGoogle = vi.mocked(authService.loginWithGoogle)

const REGISTER_PATH = '/registro'

const renderPage = () => renderWithRouter(<RegisterPage />, { route: REGISTER_PATH, path: REGISTER_PATH })

const { submitButton, googleButton } = registrationForm

describe('RegisterPage', { timeout: 20_000 }, () => {
  beforeEach(() => {
    accounts.available = true
    register.mockReset()
    loginWithGoogle.mockReset()
  })

  it('presenta el registro con su formulario y pone su título en la pestaña', async () => {
    // Arrange
    const expectedTitle = `Crear una cuenta | ${BRAND.name}`

    // Act
    renderPage()

    // Assert
    expect(screen.getByRole('heading', { level: 1, name: 'Crear una cuenta' })).toBeInTheDocument()
    expect(screen.getByRole('form', { name: 'Formulario de registro' })).toBeInTheDocument()
    await waitFor(() => expect(document.title).toBe(expectedTitle))
  })

  it('sin el servicio de cuentas avisa antes de empezar de que el registro aún no guarda los datos', () => {
    // Arrange
    accounts.available = false

    // Act
    renderPage()

    // Assert
    const note = screen.getByRole('note')
    expect(note).toHaveTextContent('El registro está en construcción')
    expect(note).toHaveTextContent('no enviará ni guardará tus datos')
  })

  it('con las cuentas activas no pone ningún aviso antes del formulario', () => {
    // Arrange: el servicio de cuentas está configurado

    // Act
    renderPage()

    // Assert
    expect(screen.queryByRole('note')).not.toBeInTheDocument()
  })

  it('ofrece iniciar sesión a quien ya tiene cuenta', () => {
    // Arrange
    const loginPath = '/iniciar-sesion'

    // Act
    renderPage()

    // Assert
    expect(screen.getByText(/¿Ya tienes cuenta\?/)).toHaveTextContent('¿Ya tienes cuenta? Inicia sesión')
    expect(screen.getByRole('link', { name: 'Inicia sesión' })).toHaveAttribute('href', loginPath)
  })

  it('crea la cuenta con los datos escritos y dice a qué correo se envió el enlace para confirmarla', async () => {
    // Arrange
    const user = userEvent.setup()
    const registration = buildRegistration()
    register.mockResolvedValue('confirmationPending')
    const { currentPath } = renderPage()
    await fillRegistrationForm(user, registration)

    // Act
    await user.click(submitButton())

    // Assert
    const notice = await screen.findByRole('status')
    expect(register).toHaveBeenCalledExactlyOnceWith(registration, anyOperationKey())
    expect(notice).toHaveTextContent('Revisa tu correo')
    expect(notice).toHaveTextContent(`Te enviamos un enlace a ${registration.email} para confirmar tu cuenta.`)
    expect(currentPath()).toBe(REGISTER_PATH)
  })

  it('mientras falta confirmar el correo ya no muestra el formulario, para que no se envíe otra vez', async () => {
    // Arrange
    const user = userEvent.setup()
    register.mockResolvedValue('confirmationPending')
    renderPage()
    await fillRegistrationForm(user)

    // Act
    await user.click(submitButton())

    // Assert
    await screen.findByRole('status')
    expect(screen.queryByRole('form', { name: 'Formulario de registro' })).not.toBeInTheDocument()
  })

  it('si la cuenta se crea con la sesión ya iniciada lleva al inicio', async () => {
    // Arrange
    const user = userEvent.setup()
    register.mockResolvedValue('signedIn')
    const { currentPath } = renderPage()
    await fillRegistrationForm(user)

    // Act
    await user.click(submitButton())

    // Assert
    await waitFor(() => expect(currentPath()).toBe('/'))
  })

  it('si no se pudo crear la cuenta, explica el motivo y se queda en la página', async () => {
    // Arrange
    const user = userEvent.setup()
    register.mockRejectedValue(new RegistrationUnavailableError())
    const { currentPath } = renderPage()
    await fillRegistrationForm(user)

    // Act
    await user.click(submitButton())

    // Assert
    expect(await screen.findByRole('alert')).toHaveTextContent('El registro aún no está disponible')
    expect(currentPath()).toBe(REGISTER_PATH)
  })

  it('registra con Google y lleva al inicio, sin pedir los datos del formulario', async () => {
    // Arrange
    const user = userEvent.setup()
    loginWithGoogle.mockResolvedValue(undefined)
    const { currentPath } = renderPage()

    // Act
    await user.click(googleButton())

    // Assert
    expect(loginWithGoogle).toHaveBeenCalledOnce()
    expect(register).not.toHaveBeenCalled()
    await waitFor(() => expect(currentPath()).toBe('/'))
  })

  it('si no se pudo registrar con Google, explica el motivo y se queda en la página', async () => {
    // Arrange
    const user = userEvent.setup()
    loginWithGoogle.mockRejectedValue(new AuthUnavailableError())
    const { currentPath } = renderPage()

    // Act
    await user.click(googleButton())

    // Assert
    expect(await screen.findByRole('alert')).toHaveTextContent('El registro aún no está disponible')
    expect(currentPath()).toBe(REGISTER_PATH)
  })
})
