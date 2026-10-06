import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import PropertySidebar from '@/features/properties/components/PropertySidebar'
import { propertyViewService } from '@/features/properties/services/propertyViewService'
import { buildProperty } from '@/test/factories'
import { quoteForm } from '@/test/quoteForm'
import { renderWithRouter } from '@/test/renderWithRouter'

const PROPERTY = buildProperty({ id: 'casa-1', advertiser: { name: 'Inmobiliaria de prueba', kind: 'inmobiliaria' } })

const follows = (first: HTMLElement, second: HTMLElement) =>
  Boolean(first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING)

/** Pinta la columna y espera a que aparezcan las vistas, lo último en llegar. */
const renderSidebar = async () => {
  renderWithRouter(<PropertySidebar property={PROPERTY} />)

  return {
    views: await screen.findByText(/en este navegador/),
    share: screen.getByRole('button', { name: 'Compartir' }),
    card: quoteForm.form().closest('[data-slot="card"]') as HTMLElement,
  }
}

describe('PropertySidebar', () => {
  beforeEach(() => {
    vi.spyOn(propertyViewService, 'registerView').mockResolvedValue(12)
  })

  it('junto al icono de compartir dice cuántas vistas lleva esta ficha', async () => {
    // Arrange: ficha con 12 visitas contadas

    // Act
    const { share, views } = await renderSidebar()

    // Assert
    expect(views).toHaveTextContent('12 vistas en este navegador')
    expect(share.parentElement).toContainElement(views)
    expect(propertyViewService.registerView).toHaveBeenCalledExactlyOnceWith('casa-1')
  })

  it('compartir y las vistas van fuera de la tarjeta del formulario, encima de ella', async () => {
    // Arrange: ficha con anunciante

    // Act
    const { share, views, card } = await renderSidebar()

    // Assert
    expect(card).not.toContainElement(share)
    expect(card).not.toContainElement(views)
    expect(follows(share, card)).toBe(true)
    expect(follows(views, card)).toBe(true)
  })

  it('la tarjeta reúne el formulario de cotización y a quién publica', async () => {
    // Arrange: ficha con anunciante

    // Act
    const { card } = await renderSidebar()

    // Assert
    expect(card).toContainElement(quoteForm.form())
    expect(card).toContainElement(screen.getByText('Publicado por'))
  })
})
