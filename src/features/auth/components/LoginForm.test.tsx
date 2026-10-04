import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import LoginForm from '@/features/auth/components/LoginForm'
import { AuthUnavailableError, InvalidCredentialsError } from '@/features/auth/services/authService'

const emailField = () => screen.getByRole('textbox', { name: 'Correo' })
const passwordField = () => screen.getByLabelText('Contraseña')
const rememberBox = () => screen.getByRole('checkbox', { name: 'Recordarme en este dispositivo' })
const submitButton = () => screen.getByRole('button', { name: /Iniciar sesión|Ingresando/ })

const signedIn = () => vi.fn(async () => {})

const fillCredentials = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(emailField(), 'ana@gmail.com')
  await user.type(passwordField(), 'secreta123')
}

describe('LoginForm', () => {
  it('pide correo y contraseña, y ofrece recordar la sesión', () => {
    // Arrange
    const onSubmit = signedIn()

    // Act
    render(<LoginForm onSubmit={onSubmit} />)

    // Assert
    expect(emailField()).toHaveAttribute('type', 'email')
    expect(passwordField()).toHaveAttribute('type', 'password')
    expect(passwordField()).toHaveAttribute('autocomplete', 'current-password')
    expect(rememberBox()).not.toBeChecked()
    expect(submitButton()).toHaveTextContent('Iniciar sesión')
  })

  it('envía el correo y la contraseña, sin recordar la sesión si no se pide', async () => {
    // Arrange
    const user = userEvent.setup()
    const onSubmit = signedIn()
    render(<LoginForm onSubmit={onSubmit} />)
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
    const user = userEvent.setup()
    const onSubmit = signedIn()
    render(<LoginForm onSubmit={onSubmit} />)
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
    const user = userEvent.setup()
    const onSubmit = signedIn()
    render(<LoginForm onSubmit={onSubmit} />)
    await fillCredentials(user)

    // Act
    await user.keyboard('{Enter}')

    // Assert
    expect(onSubmit).toHaveBeenCalledOnce()
  })

  it('permite ver la contraseña escrita antes de enviarla', async () => {
    // Arrange
    const user = userEvent.setup()
    render(<LoginForm onSubmit={signedIn()} />)
    await fillCredentials(user)

    // Act
    await user.click(screen.getByRole('button', { name: 'Mostrar contraseña' }))

    // Assert
    expect(passwordField()).toHaveAttribute('type', 'text')
    expect(passwordField()).toHaveValue('secreta123')
  })

  it('mientras entra desactiva el botón y bloquea los campos para evitar envíos duplicados', async () => {
    // Arrange
    const user = userEvent.setup()
    const onSubmit = vi.fn(() => new Promise<void>(() => {}))
    render(<LoginForm onSubmit={onSubmit} />)
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
    const user = userEvent.setup()
    const onSubmit = vi.fn(() => Promise.reject(new AuthUnavailableError()))
    render(<LoginForm onSubmit={onSubmit} />)
    await fillCredentials(user)

    // Act
    await user.click(submitButton())

    // Assert
    expect(await screen.findByRole('alert')).toHaveTextContent('El inicio de sesión aún no está disponible')
    expect(submitButton()).toBeEnabled()
  })

  it('si el correo o la contraseña no son correctos lo indica y conserva lo escrito', async () => {
    // Arrange
    const user = userEvent.setup()
    const onSubmit = vi.fn(() => Promise.reject(new InvalidCredentialsError()))
    render(<LoginForm onSubmit={onSubmit} />)
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
    const user = userEvent.setup()
    const onSubmit = vi.fn(() => Promise.reject(new Error('sin conexión')))
    render(<LoginForm onSubmit={onSubmit} />)
    await fillCredentials(user)

    // Act
    await user.click(submitButton())

    // Assert
    expect(await screen.findByRole('alert')).toHaveTextContent('Inténtalo de nuevo en unos minutos.')
  })

  it('retira el aviso del intento fallido cuando se corrigen los datos', async () => {
    // Arrange
    const user = userEvent.setup()
    const onSubmit = vi.fn(() => Promise.reject(new InvalidCredentialsError()))
    render(<LoginForm onSubmit={onSubmit} />)
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
    const user = userEvent.setup()
    const onSubmit = signedIn()
    render(<LoginForm onSubmit={onSubmit} />)

    // Act
    await user.click(submitButton())

    // Assert
    expect(onSubmit).not.toHaveBeenCalled()
    expect(emailField()).toHaveAccessibleDescription('Escribe tu correo.')
    expect(passwordField()).toHaveAccessibleDescription('Escribe tu contraseña.')
  })

  it('rechaza un correo mal escrito sin llegar a enviarlo', async () => {
    // Arrange
    const user = userEvent.setup()
    const onSubmit = signedIn()
    render(<LoginForm onSubmit={onSubmit} />)
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
    const user = userEvent.setup()
    render(<LoginForm onSubmit={signedIn()} />)
    await user.click(submitButton())

    // Act
    await user.type(emailField(), 'ana@gmail.com')

    // Assert
    expect(emailField()).toHaveAttribute('aria-invalid', 'false')
    expect(passwordField()).toHaveAttribute('aria-invalid', 'true')
  })
})
