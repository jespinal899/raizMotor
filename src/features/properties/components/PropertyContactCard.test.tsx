import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import PropertyContactCard from '@/features/properties/components/PropertyContactCard'
import { quoteService } from '@/features/properties/services/quoteService'
import { buildProperty } from '@/test/factories'
import { anyOperationKey } from '@/test/operationKey'
import { fillQuoteForm, quoteForm } from '@/test/quoteForm'
import { renderWithRouter } from '@/test/renderWithRouter'

const PROPERTY = buildProperty({
  id: 'casa-1',
  price: 420000,
  advertiser: { name: 'Inmobiliaria de prueba', kind: 'inmobiliaria' },
})

const follows = (first: HTMLElement, second: HTMLElement) =>
  Boolean(first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING)

const renderCard = (property = PROPERTY) => renderWithRouter(<PropertyContactCard property={property} />)

describe('PropertyContactCard', () => {
  it('empieza por el formulario para dejar los datos al publicador y, debajo, dice quién publica', () => {
    // Arrange: ficha con anunciante

    // Act
    renderCard()

    // Assert
    expect(follows(quoteForm.form(), screen.getByText('Publicado por'))).toBe(true)
    expect(screen.getByText('Inmobiliaria de prueba')).toBeInTheDocument()
  })

  it.each([
    ['de ejemplo, que no es de nadie', { example: true }],
    ['guardada solo en este navegador, que es de quien la ve', { localOnly: true }],
  ])('en una propiedad %s no ofrece dejar los datos al publicador', (_case, flags) => {
    // Arrange
    const property = buildProperty({ ...PROPERTY, ...flags })

    // Act
    renderCard(property)

    // Assert
    expect(screen.queryByRole('form')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Contactar al anunciante' })).toBeInTheDocument()
  })

  it('no lleva el precio ni el icono de compartir: van fuera de la tarjeta', () => {
    // Arrange: ficha de 420 000 dólares

    // Act
    renderCard()

    // Assert
    expect(screen.queryByText(/420,000/)).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Compartir' })).not.toBeInTheDocument()
  })

  it('al enviar, manda los datos del formulario al publicador de esta propiedad', async () => {
    // Arrange
    const user = userEvent.setup()
    const request = vi.spyOn(quoteService, 'request').mockResolvedValue()
    renderCard()
    await fillQuoteForm(user)

    // Act
    await user.click(quoteForm.submitButton())

    // Assert
    expect(request).toHaveBeenCalledExactlyOnceWith(
      { propertyId: 'casa-1', fullName: 'Ana Mejía', email: 'ana@gmail.com', phone: '+50499999999' },
      anyOperationKey(),
    )
    expect(await screen.findByRole('status')).toHaveTextContent('Le enviamos tus datos al publicador')
  })

  it('sin servidor, avisa de que los datos no se enviaron', async () => {
    // Arrange
    const user = userEvent.setup()
    renderCard()
    await fillQuoteForm(user)

    // Act
    await user.click(quoteForm.submitButton())

    // Assert
    const alert = await within(quoteForm.form()).findByRole('alert')
    expect(alert).toHaveTextContent('El contacto por correo aún no está disponible')
    expect(alert).toHaveTextContent('No se enviaron tus datos.')
  })

  it('junto a quién publica deja escribirle por esta propiedad', () => {
    // Arrange: ficha con anunciante

    // Act
    renderCard()

    // Assert
    const contact = screen.getByRole('link', { name: 'Contactar al anunciante' })
    expect(contact).toHaveAttribute('href', '/contacto?propiedad=casa-1')
    expect(follows(screen.getByText('Publicado por'), contact)).toBe(true)
    expect(contact.parentElement).toContainElement(screen.getByText('Publicado por'))
    expect(contact.parentElement).not.toContainElement(quoteForm.form())
  })

  it('el enlace se lee "Contactar": a quién, ya lo dice la fila en la que está', () => {
    // Arrange: ficha con anunciante

    // Act
    renderCard()

    // Assert
    expect(screen.getByRole('link', { name: 'Contactar al anunciante' })).toHaveTextContent(/^Contactar$/)
  })

  it('si quien publica dejó su teléfono, el botón le escribe por WhatsApp con el anuncio ya citado', () => {
    // Arrange
    const advertiser = { name: 'Ana Mejía', kind: 'particular', phone: '+50499999999' } as const
    const property = buildProperty({ id: 'casa-1', title: 'Casa con jardín', advertiser })

    // Act
    renderCard(property)

    // Assert
    const chat = new URL(screen.getByRole('link', { name: 'Escribir al anunciante por WhatsApp' }).getAttribute('href')!)
    expect(chat.origin + chat.pathname).toBe('https://wa.me/50499999999')
    expect(chat.searchParams.get('text')).toContain('«Casa con jardín»')
    expect(chat.searchParams.get('text')).toContain('/propiedad/casa-1')
    expect(screen.queryByRole('link', { name: 'Contactar al anunciante' })).not.toBeInTheDocument()
  })

  it('aunque no se sepa quién publica, sigue ofreciendo contactar', () => {
    // Arrange
    const property = buildProperty({ id: 'casa-1', advertiser: undefined })

    // Act
    renderCard(property)

    // Assert
    expect(screen.getByRole('link', { name: 'Contactar al anunciante' })).toHaveAttribute(
      'href',
      '/contacto?propiedad=casa-1',
    )
  })

  it('si no se sabe quién publica, la tarjeta no lo inventa', () => {
    // Arrange
    const property = buildProperty({ advertiser: undefined })

    // Act
    renderCard(property)

    // Assert
    expect(screen.queryByText('Publicado por')).not.toBeInTheDocument()
    expect(quoteForm.form()).toBeInTheDocument()
  })
})
