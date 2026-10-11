import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import PropertyQuoteForm from '@/features/properties/components/PropertyQuoteForm'
import { QuoteUnavailableError } from '@/features/properties/services/quoteService'
import { deferred } from '@/test/deferred'
import { anyOperationKey } from '@/test/operationKey'
import { fillQuoteForm, quoteForm } from '@/test/quoteForm'
import { renderWithRouter } from '@/test/renderWithRouter'

const sent = () => vi.fn(async () => {})

describe('PropertyQuoteForm', () => {
  it('se titula "Contacta al publicador en segundos" y pide nombre y apellido, correo, teléfono y aceptar los términos', () => {
    // Arrange
    const onSubmit = sent()

    // Act
    renderWithRouter(<PropertyQuoteForm onSubmit={onSubmit} />)

    // Assert
    expect(within(quoteForm.form()).getByRole('heading', { name: 'Contacta al publicador en segundos' })).toBeInTheDocument()
    expect(quoteForm.fullName()).toHaveAttribute('autocomplete', 'name')
    expect(quoteForm.email()).toHaveAttribute('type', 'email')
    expect(quoteForm.phone()).toHaveAttribute('type', 'tel')
    expect(quoteForm.terms()).not.toBeChecked()
    expect(quoteForm.submitButton()).toHaveTextContent('Enviar mis datos')
  })

  it('bajo el título explica qué pasa con los datos', () => {
    // Arrange
    const onSubmit = sent()

    // Act
    renderWithRouter(<PropertyQuoteForm onSubmit={onSubmit} />)

    // Assert
    const message = 'Déjale tus datos y te escribirá o llamará directamente.'
    const title = within(quoteForm.form()).getByRole('heading', { name: 'Contacta al publicador en segundos' })
    expect(quoteForm.form()).toHaveAccessibleDescription(message)
    expect(title.compareDocumentPosition(screen.getByText(message)) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.getByText(message).compareDocumentPosition(quoteForm.fullName()) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('el teléfono trae fijo el prefijo de Honduras: solo se escribe el número', async () => {
    // Arrange
    const user = userEvent.setup()
    renderWithRouter(<PropertyQuoteForm onSubmit={sent()} />)

    // Act
    await user.type(quoteForm.phone(), '99998888')

    // Assert
    expect(within(quoteForm.form()).getByText('+504')).toBeInTheDocument()
    expect(quoteForm.phone()).toHaveValue('9999-8888')
  })

  it('envía los datos de quien quiere que lo contacten, con el teléfono completo', async () => {
    // Arrange
    const user = userEvent.setup()
    const onSubmit = sent()
    renderWithRouter(<PropertyQuoteForm onSubmit={onSubmit} />)
    await fillQuoteForm(user)

    // Act
    await user.click(quoteForm.submitButton())

    // Assert
    expect(onSubmit).toHaveBeenCalledExactlyOnceWith(
      { fullName: 'Ana Mejía', email: 'ana@gmail.com', phone: '+50499999999' },
      anyOperationKey(),
    )
  })

  it('sin datos no envía y dice qué falta en cada campo', async () => {
    // Arrange
    const user = userEvent.setup()
    const onSubmit = sent()
    renderWithRouter(<PropertyQuoteForm onSubmit={onSubmit} />)

    // Act
    await user.click(quoteForm.submitButton())

    // Assert
    expect(onSubmit).not.toHaveBeenCalled()
    expect(quoteForm.fullName()).toHaveAccessibleDescription('Escribe tu nombre y apellido.')
    expect(quoteForm.email()).toHaveAccessibleDescription('Escribe tu correo.')
    expect(quoteForm.phone()).toHaveAccessibleDescription('Escribe tu teléfono.')
    expect(quoteForm.terms()).toHaveAccessibleDescription('Acepta los términos y condiciones para enviar tus datos.')
  })

  it('no envía si no se aceptan los términos y condiciones', async () => {
    // Arrange
    const user = userEvent.setup()
    const onSubmit = sent()
    renderWithRouter(<PropertyQuoteForm onSubmit={onSubmit} />)
    await fillQuoteForm(user)
    await user.click(quoteForm.terms())

    // Act
    await user.click(quoteForm.submitButton())

    // Assert
    expect(onSubmit).not.toHaveBeenCalled()
    expect(quoteForm.terms()).toHaveAccessibleDescription('Acepta los términos y condiciones para enviar tus datos.')
  })

  it('al aceptar los términos se retira su aviso', async () => {
    // Arrange
    const user = userEvent.setup()
    renderWithRouter(<PropertyQuoteForm onSubmit={sent()} />)
    await user.click(quoteForm.submitButton())

    // Act
    await user.click(quoteForm.terms())

    // Assert
    expect(quoteForm.terms()).toBeChecked()
    expect(quoteForm.terms()).not.toHaveAccessibleDescription()
  })

  it('mientras envía, el botón lo indica y no deja pedirla otra vez', async () => {
    // Arrange
    const user = userEvent.setup()
    const sending = deferred()
    const onSubmit = vi.fn(() => sending.promise)
    renderWithRouter(<PropertyQuoteForm onSubmit={onSubmit} />)
    await fillQuoteForm(user)

    // Act
    await user.click(quoteForm.submitButton())

    // Assert
    expect(quoteForm.submitButton()).toHaveTextContent('Enviando…')
    expect(quoteForm.submitButton()).toBeDisabled()
    expect(quoteForm.fullName()).toHaveAttribute('readonly')
    sending.finish()
    expect(await screen.findByRole('status')).toBeInTheDocument()
  })

  it('cuando el contacto por correo aún no está activo lo dice, sin fingir que se envió', async () => {
    // Arrange
    const user = userEvent.setup()
    const onSubmit = vi.fn(() => Promise.reject(new QuoteUnavailableError()))
    renderWithRouter(<PropertyQuoteForm onSubmit={onSubmit} />)
    await fillQuoteForm(user)

    // Act
    await user.click(quoteForm.submitButton())

    // Assert
    const alert = await within(quoteForm.form()).findByText('El contacto por correo aún no está disponible')
    expect(alert.closest('[role="alert"]')).toHaveTextContent('No se enviaron tus datos.')
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(quoteForm.submitButton()).toBeEnabled()
  })

  it('ante un fallo del envío lo avisa y deja reintentar', async () => {
    // Arrange
    const user = userEvent.setup()
    const onSubmit = vi.fn(() => Promise.reject(new Error('sin conexión')))
    renderWithRouter(<PropertyQuoteForm onSubmit={onSubmit} />)
    await fillQuoteForm(user)

    // Act
    await user.click(quoteForm.submitButton())

    // Assert
    expect(await within(quoteForm.form()).findByText('No pudimos enviar tus datos')).toBeInTheDocument()
    expect(quoteForm.submitButton()).toBeEnabled()
  })

  it('ya enviada, lo confirma y desactiva el botón: repetirla no enviaría nada', async () => {
    // Arrange
    const user = userEvent.setup()
    const onSubmit = sent()
    renderWithRouter(<PropertyQuoteForm onSubmit={onSubmit} />)
    await fillQuoteForm(user)

    // Act
    await user.click(quoteForm.submitButton())

    // Assert
    expect(await screen.findByRole('status')).toHaveTextContent('Le enviamos tus datos al publicador')
    expect(quoteForm.submitButton()).toBeDisabled()
  })

  it('al cambiar un dato después de enviar, el botón vuelve a activarse', async () => {
    // Arrange
    const user = userEvent.setup()
    renderWithRouter(<PropertyQuoteForm onSubmit={sent()} />)
    await fillQuoteForm(user)
    await user.click(quoteForm.submitButton())
    await screen.findByRole('status')

    // Act
    await user.type(quoteForm.fullName(), ' López')

    // Assert
    expect(quoteForm.submitButton()).toBeEnabled()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('la casilla enlaza con los términos y condiciones, que se abren en otra pestaña para no perder lo escrito', () => {
    // Arrange
    const onSubmit = sent()

    // Act
    renderWithRouter(<PropertyQuoteForm onSubmit={onSubmit} />)

    // Assert
    const terms = within(quoteForm.form()).getByRole('link', { name: 'términos y condiciones' })
    expect(terms).toHaveAttribute('href', '/terminos')
    expect(terms).toHaveAttribute('target', '_blank')
    expect(terms).toHaveAttribute('rel', 'noopener noreferrer')
  })
})
