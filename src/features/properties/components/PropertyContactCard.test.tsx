import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import PropertyContactCard from '@/features/properties/components/PropertyContactCard'
import { propertyViewService } from '@/features/properties/services/propertyViewService'
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

/** Pinta la columna y espera a que aparezcan las vistas, lo último en llegar. */
const renderCard = async (property = PROPERTY) => {
  renderWithRouter(<PropertyContactCard property={property} />)

  return { views: await screen.findByText(/en este navegador/) }
}

describe('PropertyContactCard', () => {
  beforeEach(() => {
    vi.spyOn(propertyViewService, 'registerView').mockResolvedValue(12)
  })

  it('junto al icono de compartir dice cuántas vistas lleva esta ficha', async () => {
    // Arrange: ficha con 12 visitas contadas

    // Act
    const { views } = await renderCard()

    // Assert
    const share = screen.getByRole('button', { name: 'Compartir' })
    expect(views).toHaveTextContent('12 vistas en este navegador')
    expect(share.parentElement).toContainElement(views)
    expect(propertyViewService.registerView).toHaveBeenCalledExactlyOnceWith('casa-1')
  })

  it('compartir y las vistas van arriba del formulario de cotización, y quién publica, debajo', async () => {
    // Arrange: ficha con anunciante

    // Act
    const { views } = await renderCard()

    // Assert
    const share = screen.getByRole('button', { name: 'Compartir' })
    const publisher = screen.getByText('Publicado por')
    expect(follows(share, quoteForm.form())).toBe(true)
    expect(follows(views, quoteForm.form())).toBe(true)
    expect(follows(quoteForm.form(), publisher)).toBe(true)
  })

  it('el precio encabeza la columna', async () => {
    // Arrange: ficha de 420 000 dólares

    // Act
    await renderCard()

    // Assert
    const price = screen.getByText(/420,000/)
    expect(follows(price, screen.getByRole('button', { name: 'Compartir' }))).toBe(true)
  })

  it('al cotizar pide la cotización de esta propiedad con los datos del formulario', async () => {
    // Arrange
    const user = userEvent.setup()
    const request = vi.spyOn(quoteService, 'request').mockResolvedValue()
    await renderCard()
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
    await renderCard()
    await fillQuoteForm(user)

    // Act
    await user.click(quoteForm.submitButton())

    // Assert
    const alert = await within(quoteForm.form()).findByRole('alert')
    expect(alert).toHaveTextContent('Las cotizaciones aún no están disponibles')
    expect(alert).toHaveTextContent('No se envió tu solicitud.')
  })

  it('debajo de quién publica deja escribirle por esta propiedad', async () => {
    // Arrange: ficha con anunciante

    // Act
    await renderCard()

    // Assert
    const contact = screen.getByRole('link', { name: 'Contactar al anunciante' })
    expect(contact).toHaveAttribute('href', '/contacto?propiedad=casa-1')
    expect(follows(screen.getByText('Publicado por'), contact)).toBe(true)
  })

  it('si no se sabe quién publica, la columna no lo inventa', async () => {
    // Arrange
    const property = buildProperty({ advertiser: undefined })

    // Act
    await renderCard(property)

    // Assert
    expect(screen.queryByText('Publicado por')).not.toBeInTheDocument()
    expect(quoteForm.form()).toBeInTheDocument()
  })
})
