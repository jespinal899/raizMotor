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

/** Pinta las acciones de la ficha. */
const renderToolbar = (property: Property = PROPERTY) => {
  renderWithRouter(<PropertyToolbar property={property} />)

  return { toolbar: screen.getByRole('group', { name: 'Acciones de la ficha' }) }
}

describe('PropertyToolbar', () => {
  beforeEach(() => {
    vi.spyOn(propertyViewService, 'registerView').mockResolvedValue(12)
  })

  it('reúne compartir y reportar, en ese orden', () => {
    // Arrange: propiedad del catálogo

    // Act
    const { toolbar } = renderToolbar()

    // Assert
    const share = within(toolbar).getByRole('button', { name: 'Compartir' })
    const report = within(toolbar).getByRole('button', { name: 'Reportar' })
    expect(follows(share, report)).toBe(true)
  })

  it('separa compartir de reportar con una línea', () => {
    // Arrange: propiedad del catálogo

    // Act
    const { toolbar } = renderToolbar()

    // Assert
    const divider = within(toolbar).getByRole('separator')
    expect(follows(within(toolbar).getByRole('button', { name: 'Compartir' }), divider)).toBe(true)
    expect(follows(divider, within(toolbar).getByRole('button', { name: 'Reportar' }))).toBe(true)
  })

  it('no muestra un contador de vistas que solo contaría las de este navegador', () => {
    // Arrange: propiedad del catálogo

    // Act
    const { toolbar } = renderToolbar()

    // Assert
    expect(within(toolbar).queryByText(/vistas?/)).not.toBeInTheDocument()
    expect(propertyViewService.registerView).not.toHaveBeenCalled()
  })

  it('en un anuncio guardado solo en este navegador no ofrece reportarlo: es de quien lo está viendo', () => {
    // Arrange
    const local = buildProperty({ id: 'casa-1', localOnly: true })

    // Act
    const { toolbar } = renderToolbar(local)

    // Assert
    expect(within(toolbar).getByRole('button', { name: 'Compartir' })).toBeInTheDocument()
    expect(within(toolbar).queryByRole('button', { name: 'Reportar' })).not.toBeInTheDocument()
    expect(within(toolbar).queryByRole('separator')).not.toBeInTheDocument()
  })

  it('en una propiedad de ejemplo no ofrece reportarla: no es un anuncio de nadie', () => {
    // Arrange
    const sample = buildProperty({ id: 'casa-1', example: true })

    // Act
    const { toolbar } = renderToolbar(sample)

    // Assert
    expect(within(toolbar).getByRole('button', { name: 'Compartir' })).toBeInTheDocument()
    expect(within(toolbar).queryByRole('button', { name: 'Reportar' })).not.toBeInTheDocument()
  })
})
