import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import ContactForm from '@/features/contact/components/ContactForm'
import { ContactUnavailableError } from '@/features/contact/services/contactService'

const nameField = () => screen.getByRole('textbox', { name: 'Nombre' })
const emailField = () => screen.getByRole('textbox', { name: 'Correo' })
const phoneField = () => screen.getByRole('textbox', { name: 'Teléfono (opcional)' })
const descriptionField = () => screen.getByRole('textbox', { name: 'Descripción' })
const submitButton = () => screen.getByRole('button', { name: /Enviar mensaje|Enviando/ })

const sent = () => vi.fn(async () => {})

const fillRequiredFields = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(nameField(), 'Ana')
  await user.type(emailField(), 'ana@gmail.com')
  await user.type(descriptionField(), 'Quiero publicar mi casa.')
}

describe('ContactForm', () => {
  it('pide nombre, correo, teléfono opcional y descripción', () => {
    // Arrange
    const onSubmit = sent()

    // Act
    render(<ContactForm onSubmit={onSubmit} />)

    // Assert
    expect(nameField()).toHaveValue('')
    expect(emailField()).toHaveAttribute('type', 'email')
    expect(phoneField()).toHaveAttribute('type', 'tel')
    expect(descriptionField()).toHaveValue('')
    expect(submitButton()).toHaveTextContent('Enviar mensaje')
  })

  it('rellena la descripción cuando la consulta tiene un motivo', () => {
    // Arrange
    const initialDescription = 'Me interesa el plan Inmobiliaria.'

    // Act
    render(<ContactForm initialDescription={initialDescription} onSubmit={sent()} />)

    // Assert
    expect(descriptionField()).toHaveValue(initialDescription)
  })

  it('envía los datos sin teléfono cuando se deja vacío', async () => {
    // Arrange
    const user = userEvent.setup()
    const onSubmit = sent()
    render(<ContactForm onSubmit={onSubmit} />)
    await fillRequiredFields(user)

    // Act
    await user.click(submitButton())

    // Assert
    expect(onSubmit).toHaveBeenCalledExactlyOnceWith({
      name: 'Ana',
      email: 'ana@gmail.com',
      phone: '',
      description: 'Quiero publicar mi casa.',
    })
  })

  it('incluye el teléfono cuando se indica', async () => {
    // Arrange
    const user = userEvent.setup()
    const onSubmit = sent()
    render(<ContactForm onSubmit={onSubmit} />)
    await fillRequiredFields(user)
    await user.type(phoneField(), '8915-0271')

    // Act
    await user.click(submitButton())

    // Assert
    expect(onSubmit).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ phone: '8915-0271' }))
  })

  it('confirma la recepción cuando el envío termina bien', async () => {
    // Arrange
    const user = userEvent.setup()
    render(<ContactForm onSubmit={sent()} />)
    await fillRequiredFields(user)

    // Act
    await user.click(submitButton())

    // Assert
    expect(await screen.findByRole('status')).toHaveTextContent('Recibimos tu mensaje. Te responderemos pronto.')
  })

  it('si el correo aún no está configurado lo avisa, sin confirmar ningún envío', async () => {
    // Arrange
    const user = userEvent.setup()
    const onSubmit = vi.fn(() => Promise.reject(new ContactUnavailableError()))
    render(<ContactForm onSubmit={onSubmit} />)
    await fillRequiredFields(user)

    // Act
    await user.click(submitButton())

    // Assert
    expect(await screen.findByRole('status')).toHaveTextContent('El envío por correo aún no está activo.')
    expect(screen.queryByText(/Recibimos tu mensaje/)).not.toBeInTheDocument()
  })

  it('si el envío falla muestra una alerta', async () => {
    // Arrange
    const user = userEvent.setup()
    const onSubmit = vi.fn(() => Promise.reject(new Error('sin conexión')))
    render(<ContactForm onSubmit={onSubmit} />)
    await fillRequiredFields(user)

    // Act
    await user.click(submitButton())

    // Assert
    expect(await screen.findByText(/No pudimos enviar tu mensaje/)).toBeInTheDocument()
  })

  it('mientras envía desactiva el botón para evitar envíos duplicados', async () => {
    // Arrange
    const user = userEvent.setup()
    const onSubmit = vi.fn(() => new Promise<void>(() => {}))
    render(<ContactForm onSubmit={onSubmit} />)
    await fillRequiredFields(user)

    // Act
    await user.click(submitButton())

    // Assert
    expect(submitButton()).toBeDisabled()
    expect(submitButton()).toHaveTextContent('Enviando…')
  })

  it('no envía un formulario vacío y señala cada campo obligatorio con su error', async () => {
    // Arrange
    const user = userEvent.setup()
    const onSubmit = sent()
    render(<ContactForm onSubmit={onSubmit} />)

    // Act
    await user.click(submitButton())

    // Assert
    expect(onSubmit).not.toHaveBeenCalled()
    expect(nameField()).toHaveAccessibleDescription('Escribe tu nombre.')
    expect(emailField()).toHaveAccessibleDescription('Escribe tu correo para poder responderte.')
    expect(descriptionField()).toHaveAccessibleDescription('Describe tu consulta.')
    expect(phoneField()).toHaveAttribute('aria-invalid', 'false')
  })

  it('rechaza un teléfono mal escrito aunque sea opcional', async () => {
    // Arrange
    const user = userEvent.setup()
    const onSubmit = sent()
    render(<ContactForm onSubmit={onSubmit} />)
    await fillRequiredFields(user)
    await user.type(phoneField(), '123')

    // Act
    await user.click(submitButton())

    // Assert
    expect(onSubmit).not.toHaveBeenCalled()
    expect(phoneField()).toHaveAccessibleDescription('Escribe un teléfono válido, de 8 a 15 dígitos.')
  })

  it('quita el error de un campo cuando el usuario lo corrige', async () => {
    // Arrange
    const user = userEvent.setup()
    render(<ContactForm onSubmit={sent()} />)
    await user.click(submitButton())

    // Act
    await user.type(nameField(), 'Ana')

    // Assert
    expect(nameField()).toHaveAttribute('aria-invalid', 'false')
    expect(emailField()).toHaveAttribute('aria-invalid', 'true')
  })
})
