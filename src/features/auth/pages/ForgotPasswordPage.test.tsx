import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ForgotPasswordPage from '@/features/auth/pages/ForgotPasswordPage'
import { CodeRequestTooSoonError, InvalidCodeError } from '@/features/auth/services/authErrors'
import { authService } from '@/features/auth/services/authService'
import { BRAND } from '@/shared/constants/brand'
import { renderWithRouter } from '@/test/renderWithRouter'

/** Si la compilación conoce el servicio de cuentas: cada prueba puede cambiarlo. */
const accounts = vi.hoisted(() => ({ available: true }))

vi.mock('@/features/auth/services/authService', () => ({
  get ACCOUNTS_AVAILABLE() {
    return accounts.available
  },
  authService: { requestPasswordReset: vi.fn(), resetPassword: vi.fn() },
}))

const requestPasswordReset = vi.mocked(authService.requestPasswordReset)
const resetPassword = vi.mocked(authService.resetPassword)

const FORGOT_PATH = '/recuperar-contrasena'

const renderPage = () => renderWithRouter(<ForgotPasswordPage />, { route: FORGOT_PATH, path: FORGOT_PATH })

const emailField = () => screen.getByRole('textbox', { name: 'Correo' })
const submitButton = () => screen.getByRole('button', { name: /^Enviar código$|Enviando/ })

const askFor = async (email: string) => {
  const user = userEvent.setup()
  await user.type(emailField(), email)
  await user.click(submitButton())

  return user
}

/** Pide el código y escribe el que llegó, con la contraseña nueva repetida. */
const resetWith = async ({
  code = '123456',
  password = 'nueva-secreta',
  confirmation,
}: { code?: string; password?: string; confirmation?: string } = {}) => {
  requestPasswordReset.mockResolvedValue(undefined)
  const view = renderPage()
  const user = await askFor('ana@gmail.com')
  await user.type(await screen.findByRole('textbox', { name: /Código de verificación/ }), code)
  await user.type(screen.getByLabelText(/^Contraseña nueva/), password)
  await user.type(screen.getByLabelText('Repite la contraseña nueva'), confirmation ?? password)
  await user.click(screen.getByRole('button', { name: /^Guardar contraseña$|Guardando/ }))

  return view
}

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    accounts.available = true
    requestPasswordReset.mockReset()
    resetPassword.mockReset()
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

  it('dice que enviará un código de verificación', () => {
    // Arrange: visitante que olvidó su contraseña

    // Act
    renderPage()

    // Assert
    expect(screen.getByText('Te enviaremos un código de verificación para que puedas actualizar tu contraseña.')).toBeInTheDocument()
  })

  it('pide el código para el correo escrito y pasa a escribirlo, sin decir si la cuenta existe', async () => {
    // Arrange
    requestPasswordReset.mockResolvedValue(undefined)
    renderPage()

    // Act
    await askFor('ana@gmail.com')

    // Assert
    const notice = await screen.findByRole('status')
    expect(requestPasswordReset).toHaveBeenCalledExactlyOnceWith('ana@gmail.com')
    expect(notice).toHaveTextContent('Si hay una cuenta con ana@gmail.com, te enviamos un código de 6 dígitos. Vence en 15 minutos.')
    expect(screen.getByRole('form', { name: 'Formulario para elegir otra contraseña' })).toBeInTheDocument()
    expect(screen.queryByRole('textbox', { name: 'Correo' })).not.toBeInTheDocument()
  })

  it('con el código y la contraseña nueva la guarda y lleva a la portada, que avisa del cambio', async () => {
    // Arrange
    resetPassword.mockResolvedValue(undefined)

    // Act
    const { currentPath } = await resetWith()

    // Assert
    await waitFor(() => expect(currentPath()).toBe('/'))
    expect(resetPassword).toHaveBeenCalledExactlyOnceWith(
      { email: 'ana@gmail.com', code: '123456', password: 'nueva-secreta' },
      expect.any(String),
    )
  })

  it('si el código no es correcto o venció lo explica y deja corregirlo', async () => {
    // Arrange
    resetPassword.mockRejectedValue(new InvalidCodeError())

    // Act
    const { currentPath } = await resetWith()

    // Assert
    expect(await screen.findByText('El código no es correcto o ya venció')).toBeInTheDocument()
    expect(currentPath()).toBe(FORGOT_PATH)
  })

  it('no envía nada si las contraseñas no coinciden o el código no tiene 6 dígitos', async () => {
    // Arrange: el código y la contraseña se escriben mal

    // Act
    await resetWith({ code: '123', confirmation: 'otra-distinta' })

    // Assert
    expect(resetPassword).not.toHaveBeenCalled()
    expect(screen.getByRole('textbox', { name: /Código de verificación/ })).toHaveAccessibleDescription(/El código tiene 6 dígitos/)
    expect(screen.getByLabelText('Repite la contraseña nueva')).toHaveAccessibleDescription('Las contraseñas no coinciden.')
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

  it('si el código no se pudo enviar lo avisa y deja reintentar', async () => {
    // Arrange
    requestPasswordReset.mockRejectedValue(new Error('sin conexión'))
    renderPage()

    // Act
    await askFor('ana@gmail.com')

    // Assert
    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos enviar el código. Inténtalo de nuevo en unos minutos.')
    expect(submitButton()).toBeEnabled()
  })

  it('si se pide otro código demasiado pronto, pide esperar', async () => {
    // Arrange
    requestPasswordReset.mockRejectedValue(new CodeRequestTooSoonError())
    renderPage()

    // Act
    await askFor('ana@gmail.com')

    // Assert
    expect(await screen.findByText('Espera un momento')).toBeInTheDocument()
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
