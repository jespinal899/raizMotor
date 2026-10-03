import { screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import PropertyDetailPage from '@/features/properties/pages/PropertyDetailPage'
import { propertyService } from '@/features/properties/services/propertyService'
import { BRAND } from '@/shared/constants/brand'
import { buildProperty } from '@/test/factories'
import { renderWithRouter } from '@/test/renderWithRouter'

vi.mock('@/features/properties/services/propertyService', () => ({
  propertyService: { getFeatured: vi.fn(), search: vi.fn(), getById: vi.fn() },
}))

const getById = vi.mocked(propertyService.getById)

const renderPage = (id: string) =>
  renderWithRouter(<PropertyDetailPage />, { route: `/propiedad/${id}`, path: '/propiedad/:id' })

describe('PropertyDetailPage', () => {
  beforeEach(() => {
    getById.mockReset()
  })

  it('muestra un esqueleto mientras carga', () => {
    // Arrange
    getById.mockReturnValue(new Promise(() => {}))

    // Act
    renderPage('casa-1')

    // Assert
    expect(screen.getByLabelText('Cargando propiedad')).toHaveAttribute('aria-busy', 'true')
  })

  it('muestra la propiedad del identificador de la URL y pone su título en la pestaña', async () => {
    // Arrange
    getById.mockResolvedValue(buildProperty({ id: 'casa-1', title: 'Casa con jardín' }))

    // Act
    renderPage('casa-1')

    // Assert
    expect(await screen.findByRole('heading', { level: 1, name: 'Casa con jardín' })).toBeInTheDocument()
    expect(getById).toHaveBeenCalledWith('casa-1')
    expect(document.title).toBe(`Casa con jardín | ${BRAND.name}`)
  })

  it('avisa cuando la propiedad no existe y ofrece ver las demás', async () => {
    // Arrange
    getById.mockResolvedValue(undefined)

    // Act
    renderPage('no-existe')

    // Assert
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Esta propiedad ya no está disponible' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver todas las propiedades' })).toHaveAttribute('href', '/propiedades')
    expect(document.title).toBe(`Esta propiedad ya no está disponible | ${BRAND.name}`)
  })

  it('avisa cuando la carga falla', async () => {
    // Arrange
    getById.mockRejectedValue(new Error('API caída'))

    // Act
    renderPage('casa-1')

    // Assert
    expect(await screen.findByRole('heading', { level: 1, name: 'No pudimos cargar la propiedad' })).toBeInTheDocument()
  })

  it('restaura el título de la pestaña al salir de la página', async () => {
    // Arrange
    getById.mockResolvedValue(buildProperty({ title: 'Casa con jardín' }))
    const { unmount } = renderPage('casa-1')
    await waitFor(() => expect(document.title).toBe(`Casa con jardín | ${BRAND.name}`))

    // Act
    unmount()

    // Assert
    expect(document.title).toBe(BRAND.name)
  })
})
