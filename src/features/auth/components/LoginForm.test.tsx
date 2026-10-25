import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import LoginForm from '@/features/auth/components/LoginForm'
import {
  AuthUnavailableError,
  EmailNotConfirmedError,
  InvalidCodeError,
  InvalidCredentialsError,
} from '@/features/auth/services/authErrors'
import type { LoginCredentials } from '@/features/auth/types/auth.types'
import { renderWithRouter } from '@/test/renderWithRouter'

type Submit = (credentials: LoginCredentials) => Promise<void>
type GoogleSignIn = () => Promise<void>
type ConfirmEmail = (email: string, code: string) => Promise<void>
type Resend = (email: string) => Promise<void>

interface Handlers {
  onSubmit?: Submit
  onGoogleSignIn?: GoogleSignIn
  onConfirmEmail?: ConfirmEmail
}

const setup = ({
  onSubmit = vi.fn<Submit>(async () => {}),
  onGoogleSignIn = vi.fn<GoogleSignIn>(async () => {}),
  onConfirmEmail = vi.fn<ConfirmEmail>(async () => {}),
}: Handlers = {}) => {
  const onResendConfirmation = vi.fn<Resend>(async () => {})
  renderWithRouter(
    <LoginForm
      onSubmit={onSubmit}
      onGoogleSignIn={onGoogleSignIn}
      onConfirmEmail={onConfirmEmail}
      onResendConfirmation={onResendConfirmation}
    />,
  )

  return { onSubmit, onGoogleSignIn, onConfirmEmail, onResendConfirmation, user: userEvent.setup() }
}

const emailField = () => screen.getByRole('textbox', { name: 'Correo' })
const passwordField = () => screen.getByLabelText('Contraseña')
const rememberBox = () => screen.getByRole('checkbox', { name: 'Recordarme en este dispositivo' })
const submitButton = () => screen.getByRole('button', { name: /^Iniciar sesión$|Ingresando/ })

const pending = () => new Promise<void>(() => {})

const fillCredentials = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(emailField(), 'ana@gmail.com')
  await user.type(passwordField(), 'secreta123')
}

describe('LoginForm', () => {
  it('pide correo y contraseña, y ofrece recordar la sesión', () => {
    // Arrange: formulario recién abierto

    // Act
    setup()

    // Assert
    expect(emailField()).toHaveAttribute('type', 'email')
    expect(passwordField()).toHaveAttribute('type', 'password')
    expect(passwordField()).toHaveAttribute('autocomplete', 'current-password')
    expect(rememberBox()).not.toBeChecked()
    expect(submitButton()).toHaveTextContent('Iniciar sesión')
  })

  it('ofrece recuperar la contraseña a quien la olvidó', () => {
    // Arrange
    const recoveryPath = '/recuperar-contrasena'

    // Act
    setup()

    // Assert
    expect(screen.getByRole('link', { name: 'Olvidé mi contraseña' })).toHaveAttribute('href', recoveryPath)
  })

  it('no ofrece entrar con Google mientras el sitio no esté dado de alta en Google', () => {
    // Arrange: formulario recién abierto

    // Act
    setup()

    // Assert
    expect(screen.queryByText('O continúa con')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Google/ })).not.toBeInTheDocument()
  })

  it('envía el correo y la contraseña, sin recordar la sesión si no se pide', async () => {
    // Arrange
    const { onSubmit, user } = setup()
    await fillCredentials(user)

    // Act
    await user.click(submitButton())

    // Assert
    expect(onSubmit).toHaveBeenCalledExactlyOnceWith({
      email: 'ana@gmail.com',
      password: 'secreta123',
      remember: false,
    })
  })

  it('pide recordar la sesión cuando se marca la casilla', async () => {
    // Arrange
    const { onSubmit, user } = setup()
    await fillCredentials(user)
    await user.click(rememberBox())

    // Act
    await user.click(submitButton())

    // Assert
    expect(rememberBox()).toBeChecked()
    expect(onSubmit).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ remember: true }))
  })

  it('se puede enviar con la tecla Enter desde la contraseña', async () => {
    // Arrange
    const { onSubmit, user } = setup()
    await fillCredentials(user)

    // Act
    await user.keyboard('{Enter}')

    // Assert
    expect(onSubmit).toHaveBeenCalledOnce()
  })

  it('permite ver la contraseña escrita antes de enviarla', async () => {
    // Arrange
    const { user } = setup()
    await fillCredentials(user)

    // Act
    await user.click(screen.getByRole('button', { name: 'Mostrar contraseña' }))

    // Assert
    expect(passwordField()).toHaveAttribute('type', 'text')
    expect(passwordField()).toHaveValue('secreta123')
  })

  it('mientras entra desactiva el botón y bloquea los campos, para evitar envíos duplicados', async () => {
    // Arrange
    const { user } = setup({ onSubmit: pending })
    await fillCredentials(user)

    // Act
    await user.click(submitButton())

    // Assert
    expect(submitButton()).toBeDisabled()
    expect(submitButton()).toHaveTextContent('Ingresando…')
    expect(emailField()).toHaveAttribute('readonly')
    expect(passwordField()).toHaveAttribute('readonly')
  })

  it('si las cuentas aún no están activas lo avisa, sin dar la sesión por iniciada', async () => {
    // Arrange
    const { user } = setup({ onSubmit: () => Promise.reject(new AuthUnavailableError()) })
    await fillCredentials(user)

    // Act
    await user.click(submitButton())

    // Assert
    expect(await screen.findByRole('alert')).toHaveTextContent('El inicio de sesión aún no está disponible')
    expect(submitButton()).toBeEnabled()
  })

  it('si el correo o la contraseña no son correctos lo indica y conserva lo escrito', async () => {
    // Arrange
    const { user } = setup({ onSubmit: () => Promise.reject(new InvalidCredentialsError()) })
    await fillCredentials(user)

    // Act
    await user.click(submitButton())

    // Assert
    expect(await screen.findByRole('alert')).toHaveTextContent('El correo o la contraseña no son correctos.')
    expect(emailField()).toHaveValue('ana@gmail.com')
    expect(passwordField()).toHaveValue('secreta123')
  })

  it('si el servicio falla muestra una alerta para reintentar', async () => {
    // Arrange
    const { user } = setup({ onSubmit: () => Promise.reject(new Error('sin conexión')) })
    await fillCredentials(user)

    // Act
    await user.click(submitButton())

    // Assert
    expect(await screen.findByRole('alert')).toHaveTextContent('Inténtalo de nuevo en unos minutos.')
  })

  it('retira el aviso del intento fallido cuando se corrigen los datos', async () => {
    // Arrange
    const { user } = setup({ onSubmit: () => Promise.reject(new InvalidCredentialsError()) })
    await fillCredentials(user)
    await user.click(submitButton())
    await screen.findByRole('alert')

    // Act
    await user.type(passwordField(), '4')

    // Assert
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('no envía un formulario vacío y señala cada campo con su error', async () => {
    // Arrange
    const { onSubmit, user } = setup()

    // Act
    await user.click(submitButton())

    // Assert
    expect(onSubmit).not.toHaveBeenCalled()
    expect(emailField()).toHaveAccessibleDescription('Escribe tu correo.')
    expect(passwordField()).toHaveAccessibleDescription('Escribe tu contraseña.')
  })

  it('rechaza un correo mal escrito sin llegar a enviarlo', async () => {
    // Arrange
    const { onSubmit, user } = setup()
    await user.type(emailField(), 'ana@gmail')
    await user.type(passwordField(), 'secreta123')

    // Act
    await user.click(submitButton())

    // Assert
    expect(onSubmit).not.toHaveBeenCalled()
    expect(emailField()).toHaveAccessibleDescription('Revisa el correo: debe tener el formato nombre@dominio.com.')
  })

  it('quita el error de un campo cuando el usuario lo corrige', async () => {
    // Arrange
    const { user } = setup()
    await user.click(submitButton())

    // Act
    await user.type(emailField(), 'ana@gmail.com')

    // Assert
    expect(emailField()).toHaveAttribute('aria-invalid', 'false')
    expect(passwordField()).toHaveAttribute('aria-invalid', 'true')
  })
})

describe('LoginForm: cuenta sin activar', () => {
  it('si la cuenta no está activa, ofrece activarla con el código que llegó al correo', async () => {
    // Arrange
    const { user, onConfirmEmail } = setup({ onSubmit: vi.fn<Submit>(async () => Promise.reject(new EmailNotConfirmedError())) })
    await fillCredentials(user)
    await user.click(submitButton())

    // Act
    await user.type(await screen.findByRole('textbox', { name: /Código de verificación/ }), '123 456')
    await user.click(screen.getByRole('button', { name: 'Confirmar mi cuenta' }))

    // Assert
    expect(screen.getByText('Confirma tu correo para entrar')).toBeInTheDocument()
    expect(onConfirmEmail).toHaveBeenCalledExactlyOnceWith('ana@gmail.com', '123456')
  })

  it('a quien vuelve sin haber activado su cuenta le deja pedir otro código en el acto', async () => {
    // Arrange
    const { user, onResendConfirmation } = setup({
      onSubmit: vi.fn<Submit>(async () => Promise.reject(new EmailNotConfirmedError())),
    })
    await fillCredentials(user)
    await user.click(submitButton())

    // Act
    await user.click(await screen.findByRole('button', { name: 'Reenviar código' }))

    // Assert
    expect(onResendConfirmation).toHaveBeenCalledExactlyOnceWith('ana@gmail.com')
    expect(await screen.findByText('Te enviamos otro código')).toBeInTheDocument()
  })

  it('un código que no vale se explica', async () => {
    // Arrange
    const { user } = setup({
      onSubmit: vi.fn<Submit>(async () => Promise.reject(new EmailNotConfirmedError())),
      onConfirmEmail: vi.fn<ConfirmEmail>(async () => Promise.reject(new InvalidCodeError())),
    })
    await fillCredentials(user)
    await user.click(submitButton())

    // Act
    await user.type(await screen.findByRole('textbox', { name: /Código de verificación/ }), '000000')
    await user.click(screen.getByRole('button', { name: 'Confirmar mi cuenta' }))

    // Assert
    expect(await screen.findByText('El código no es correcto o ya venció')).toBeInTheDocument()
  })
})
