import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import RegisterForm from '@/features/auth/components/RegisterForm'
import { AuthUnavailableError, RegistrationUnavailableError } from '@/features/auth/services/authService'
import type { RegistrationCredentials } from '@/features/auth/types/auth.types'
import { MAX_NAME_LENGTH, MIN_PASSWORD_LENGTH } from '@/features/auth/utils/registerValidation'
import { buildRegistration } from '@/test/factories'
import { fillRegistrationForm, registrationForm } from '@/test/registrationForm'

type Submit = (credentials: RegistrationCredentials) => Promise<void>
type GoogleSignUp = () => Promise<void>

interface Handlers {
  onSubmit?: Submit
  onGoogleSignUp?: GoogleSignUp
}

const setup = ({
  onSubmit = vi.fn<Submit>(async () => {}),
  onGoogleSignUp = vi.fn<GoogleSignUp>(async () => {}),
}: Handlers = {}) => {
  render(<RegisterForm onSubmit={onSubmit} onGoogleSignUp={onGoogleSignUp} />)

  return { onSubmit, onGoogleSignUp, user: userEvent.setup() }
}

const { firstName, lastName, email, phone, password, submitButton, googleButton } = registrationForm

const pending = () => new Promise<void>(() => {})

describe('RegisterForm', { timeout: 20_000 }, () => {
  it('pide nombre, apellido, correo, teléfono y contraseña, y deja que el navegador los autocomplete', () => {
    // Arrange: formulario recién abierto

    // Act
    setup()

    // Assert
    expect(firstName()).toHaveAttribute('autocomplete', 'given-name')
    expect(lastName()).toHaveAttribute('autocomplete', 'family-name')
    expect(email()).toHaveAttribute('type', 'email')
    expect(phone()).toHaveAttribute('type', 'tel')
    expect(phone()).toHaveAttribute('autocomplete', 'tel-national')
    expect(password()).toHaveAttribute('type', 'password')
    expect(password()).toHaveAttribute('autocomplete', 'new-password')
    expect(submitButton()).toHaveTextContent('Crear cuenta')
  })

  it('dice junto a la contraseña cuántos caracteres necesita y limita el largo del nombre y del apellido', () => {
    // Arrange
    const passwordLabel = `Contraseña (mínimo ${MIN_PASSWORD_LENGTH} caracteres)`

    // Act
    setup()

    // Assert
    expect(screen.getByLabelText(passwordLabel)).toHaveAttribute('minlength', String(MIN_PASSWORD_LENGTH))
    expect(firstName()).toHaveAttribute('maxlength', String(MAX_NAME_LENGTH))
    expect(lastName()).toHaveAttribute('maxlength', String(MAX_NAME_LENGTH))
  })

  it('el teléfono lleva fijo el prefijo de Honduras: solo se escribe el número y se envía completo', async () => {
    // Arrange
    const { onSubmit, user } = setup()
    await fillRegistrationForm(user, buildRegistration({ phone: '' }))

    // Act
    await user.type(phone(), '89150271')
    await user.click(submitButton())

    // Assert
    expect(screen.getByText('+504')).toBeInTheDocument()
    expect(phone()).toHaveValue('8915-0271')
    expect(onSubmit).toHaveBeenCalledExactlyOnceWith(buildRegistration({ phone: '+50489150271' }))
  })

  it('rechaza un teléfono incompleto sin llegar a enviarlo', async () => {
    // Arrange
    const { onSubmit, user } = setup()
    await fillRegistrationForm(user, buildRegistration({ phone: '8915' }))

    // Act
    await user.click(submitButton())

    // Assert
    expect(onSubmit).not.toHaveBeenCalled()
    expect(phone()).toHaveAccessibleDescription('Escribe los 8 dígitos de tu número.')
  })

  it('envía los datos escritos', async () => {
    // Arrange
    const registration = buildRegistration()
    const { onSubmit, user } = setup()
    await fillRegistrationForm(user, registration)

    // Act
    await user.click(submitButton())

    // Assert
    expect(onSubmit).toHaveBeenCalledExactlyOnceWith(registration)
  })

  it('se puede enviar con la tecla Enter desde la contraseña', async () => {
    // Arrange
    const { onSubmit, user } = setup()
    await fillRegistrationForm(user)

    // Act
    await user.type(password(), '{Enter}')

    // Assert
    expect(onSubmit).toHaveBeenCalledOnce()
  })

  it('no envía un formulario vacío y señala cada campo con su error', async () => {
    // Arrange
    const { onSubmit, user } = setup()

    // Act
    await user.click(submitButton())

    // Assert
    expect(onSubmit).not.toHaveBeenCalled()
    expect(firstName()).toHaveAccessibleDescription('Escribe tu nombre.')
    expect(lastName()).toHaveAccessibleDescription('Escribe tu apellido.')
    expect(email()).toHaveAccessibleDescription('Escribe tu correo.')
    expect(phone()).toHaveAccessibleDescription('Escribe tu teléfono.')
    expect(password()).toHaveAccessibleDescription('Escribe tu contraseña.')
  })

  it('rechaza una contraseña demasiado corta sin llegar a enviarla', async () => {
    // Arrange
    const { onSubmit, user } = setup()
    await fillRegistrationForm(user, buildRegistration({ password: 'corta' }))

    // Act
    await user.click(submitButton())

    // Assert
    expect(onSubmit).not.toHaveBeenCalled()
    expect(password()).toHaveAccessibleDescription(`Usa al menos ${MIN_PASSWORD_LENGTH} caracteres.`)
  })

  it('quita el error de un campo cuando se corrige', async () => {
    // Arrange
    const { user } = setup()
    await user.click(submitButton())

    // Act
    await user.type(firstName(), 'A')

    // Assert
    expect(firstName()).toHaveAttribute('aria-invalid', 'false')
    expect(lastName()).toHaveAttribute('aria-invalid', 'true')
  })

  it('mientras crea la cuenta desactiva los dos botones y bloquea los campos, para evitar envíos duplicados', async () => {
    // Arrange
    const { user } = setup({ onSubmit: pending })
    await fillRegistrationForm(user)

    // Act
    await user.click(submitButton())

    // Assert
    expect(submitButton()).toBeDisabled()
    expect(submitButton()).toHaveTextContent('Creando cuenta…')
    expect(googleButton()).toBeDisabled()
    for (const field of [firstName, lastName, email, phone, password]) expect(field()).toHaveAttribute('readonly')
  })

  it('si el registro aún no está activo lo avisa, sin dar la cuenta por creada, y conserva lo escrito', async () => {
    // Arrange
    const { user } = setup({ onSubmit: () => Promise.reject(new RegistrationUnavailableError()) })
    await fillRegistrationForm(user)

    // Act
    await user.click(submitButton())

    // Assert
    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('El registro aún no está disponible')
    expect(alert).toHaveTextContent('No se creó ninguna cuenta.')
    expect(email()).toHaveValue('ana@gmail.com')
    expect(submitButton()).toBeEnabled()
  })

  it('si el servicio falla muestra una alerta para reintentar', async () => {
    // Arrange
    const { user } = setup({ onSubmit: () => Promise.reject(new Error('sin conexión')) })
    await fillRegistrationForm(user)

    // Act
    await user.click(submitButton())

    // Assert
    expect(await screen.findByRole('alert')).toHaveTextContent('Inténtalo de nuevo en unos minutos.')
  })

  it('retira el aviso del intento fallido cuando se corrigen los datos', async () => {
    // Arrange
    const { user } = setup({ onSubmit: () => Promise.reject(new Error('sin conexión')) })
    await fillRegistrationForm(user)
    await user.click(submitButton())
    await screen.findByRole('alert')

    // Act
    await user.type(phone(), '1')

    // Assert
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})

describe('RegisterForm: registrarse con Google', () => {
  it('lo presenta como la otra forma de continuar, sin enviar el formulario', () => {
    // Arrange: formulario recién abierto

    // Act
    setup()

    // Assert
    expect(screen.getByText('O continúa con')).toBeInTheDocument()
    expect(googleButton()).toHaveTextContent('Registrarse con Google')
    expect(googleButton()).toHaveAttribute('type', 'button')
  })

  it('lo ofrece como alternativa y no pide rellenar el formulario', async () => {
    // Arrange
    const { onGoogleSignUp, onSubmit, user } = setup()

    // Act
    await user.click(googleButton())

    // Assert
    expect(onGoogleSignUp).toHaveBeenCalledOnce()
    expect(onSubmit).not.toHaveBeenCalled()
    expect(email()).toHaveAttribute('aria-invalid', 'false')
  })

  it('mientras conecta lo indica y desactiva los dos botones', async () => {
    // Arrange
    const { user } = setup({ onGoogleSignUp: pending })

    // Act
    await user.click(googleButton())

    // Assert
    expect(googleButton()).toBeDisabled()
    expect(googleButton()).toHaveTextContent('Conectando con Google…')
    expect(submitButton()).toBeDisabled()
  })

  it('si el acceso con Google aún no está activo lo avisa, sin dar la cuenta por creada', async () => {
    // Arrange
    const { user } = setup({ onGoogleSignUp: () => Promise.reject(new AuthUnavailableError()) })

    // Act
    await user.click(googleButton())

    // Assert
    expect(await screen.findByRole('alert')).toHaveTextContent('El registro aún no está disponible')
    expect(googleButton()).toBeEnabled()
  })
})
