import { screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import PropertyToolbar from '@/features/properties/components/PropertyToolbar'
import { propertyViewService } from '@/features/properties/services/propertyViewService'
import type { Property } from '@/features/properties/types/property.types'
import { buildProperty } from '@/test/factories'
import { renderWithRouter } from '@/test/renderWithRouter'

const PROPERTY = buildProperty({ id: 'casa-1' })

const follows = (first: HTMLElement, second: HTMLElement) =>
  Boolean(first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING)

/** Pinta las acciones y espera a que aparezcan las vistas, lo último en llegar. */
const renderToolbar = async (property: Property = PROPERTY) => {
  renderWithRouter(<PropertyToolbar property={property} />)
  const toolbar = screen.getByRole('group', { name: 'Acciones de la ficha' })

  return { toolbar, views: await within(toolbar).findByText(/en este navegador/) }
}

describe('PropertyToolbar', () => {
  beforeEach(() => {
    vi.spyOn(propertyViewService, 'registerView').mockResolvedValue(12)
  })

  it('reúne compartir, reportar y las vistas, en ese orden', async () => {
    // Arrange: propiedad del catálogo

    // Act
    const { toolbar, views } = await renderToolbar()

    // Assert
    const share = within(toolbar).getByRole('button', { name: 'Compartir' })
    const report = within(toolbar).getByRole('button', { name: 'Reportar' })
    expect(follows(share, report)).toBe(true)
    expect(follows(report, views)).toBe(true)
  })

  it('separa compartir de reportar con una línea', async () => {
    // Arrange: propiedad del catálogo

    // Act
    const { toolbar } = await renderToolbar()

    // Assert
    const divider = within(toolbar).getByRole('separator')
    expect(follows(within(toolbar).getByRole('button', { name: 'Compartir' }), divider)).toBe(true)
    expect(follows(divider, within(toolbar).getByRole('button', { name: 'Reportar' }))).toBe(true)
  })

  it('cuenta la visita a esta ficha y dice cuántas lleva', async () => {
    // Arrange: ficha con 12 visitas contadas

    // Act
    const { views } = await renderToolbar()

    // Assert
    expect(views).toHaveTextContent('12 vistas en este navegador')
    expect(propertyViewService.registerView).toHaveBeenCalledExactlyOnceWith('casa-1')
  })

  it('en un anuncio guardado solo en este navegador no ofrece reportarlo: es de quien lo está viendo', async () => {
    // Arrange
    const local = buildProperty({ id: 'casa-1', localOnly: true })

    // Act
    const { toolbar } = await renderToolbar(local)

    // Assert
    expect(within(toolbar).getByRole('button', { name: 'Compartir' })).toBeInTheDocument()
    expect(within(toolbar).queryByRole('button', { name: 'Reportar' })).not.toBeInTheDocument()
    expect(within(toolbar).queryByRole('separator')).not.toBeInTheDocument()
  })
})
