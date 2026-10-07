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
  it('empieza por el formulario de cotización y, debajo, dice quién publica', () => {
    // Arrange: ficha con anunciante

    // Act
    renderCard()

    // Assert
    expect(follows(quoteForm.form(), screen.getByText('Publicado por'))).toBe(true)
    expect(screen.getByText('Inmobiliaria de prueba')).toBeInTheDocument()
  })

  it('no lleva el precio ni el icono de compartir: van fuera de la tarjeta', () => {
    // Arrange: ficha de 420 000 dólares

    // Act
    renderCard()

    // Assert
    expect(screen.queryByText(/420,000/)).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Compartir' })).not.toBeInTheDocument()
  })

  it('al cotizar pide la cotización de esta propiedad con los datos del formulario', async () => {
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
    expect(await screen.findByRole('status')).toHaveTextContent('Recibimos tu solicitud')
  })

  it('hoy, sin servidor, avisa de que la cotización no se envió', async () => {
    // Arrange
    const user = userEvent.setup()
    renderCard()
    await fillQuoteForm(user)

    // Act
    await user.click(quoteForm.submitButton())

    // Assert
    const alert = await within(quoteForm.form()).findByRole('alert')
    expect(alert).toHaveTextContent('Las cotizaciones aún no están disponibles')
    expect(alert).toHaveTextContent('No se envió tu solicitud.')
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
