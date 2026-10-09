import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import MyPropertiesPage from '@/features/properties/pages/MyPropertiesPage'
import { propertyService } from '@/features/properties/services/propertyService'
import { publicationService } from '@/features/properties/services/publicationService'
import type { Property } from '@/features/properties/types/property.types'
import { BRAND } from '@/shared/constants/brand'
import { buildProperty } from '@/test/factories'
import { renderWithRouter } from '@/test/renderWithRouter'

vi.mock('@/features/properties/services/propertyService', () => ({ propertyService: { getOwn: vi.fn() } }))
vi.mock('@/features/properties/services/publicationService', () => ({ publicationService: { remove: vi.fn() } }))

const getOwn = vi.mocked(propertyService.getOwn)
const remove = vi.mocked(publicationService.remove)

const HOUSE = buildProperty({ id: 'casa-1', title: 'Casa con jardín' })
const LAND = buildProperty({ id: 'terreno-1', title: 'Terreno en Valle de Ángeles', type: 'terreno' })

const renderPage = (own: Property[] = [HOUSE, LAND]) => {
  getOwn.mockResolvedValue(own)

  return renderWithRouter(<MyPropertiesPage />, { route: '/mis-anuncios', path: '/mis-anuncios' })
}

/** Con la ventana de confirmar abierta, el resto de la página queda oculto a los lectores de pantalla: se busca igual. */
const ad = (title: string) => screen.queryByRole('heading', { name: title, hidden: true })

/** Abre la ventana que pide confirmar el borrado del anuncio con ese título. */
const askToDelete = async (title: string) => {
  const user = userEvent.setup()
  const item = (await screen.findByRole('heading', { name: title })).closest('li')!
  await user.click(within(item).getByRole('button', { name: 'Eliminar' }))

  return { user, dialog: within(await screen.findByRole('dialog')) }
}

describe('MyPropertiesPage', () => {
  beforeEach(() => {
    getOwn.mockReset()
    remove.mockReset()
  })

  it('lista los anuncios de quien tiene la sesión y pone su título en la pestaña', async () => {
    // Arrange
    const expectedTitle = `Mis anuncios | ${BRAND.name}`

    // Act
    renderPage()

    // Assert
    expect(await screen.findByRole('heading', { level: 1, name: 'Mis anuncios' })).toBeInTheDocument()
    expect(ad('Casa con jardín')).toBeInTheDocument()
    expect(ad('Terreno en Valle de Ángeles')).toBeInTheDocument()
    await waitFor(() => expect(document.title).toBe(expectedTitle))
  })

  it('cada anuncio lleva a su formulario para corregirlo', async () => {
    // Arrange: cuenta con dos anuncios

    // Act
    renderPage()

    // Assert
    const item = (await screen.findByRole('heading', { name: 'Casa con jardín' })).closest('li')!
    expect(within(item).getByRole('link', { name: 'Editar' })).toHaveAttribute('href', '/mis-anuncios/casa-1/editar')
  })

  it('mientras los lee muestra un marcador de carga', () => {
    // Arrange
    getOwn.mockReturnValue(new Promise<Property[]>(() => {}))

    // Act
    renderWithRouter(<MyPropertiesPage />)

    // Assert
    expect(screen.getByLabelText('Cargando página')).toBeInTheDocument()
  })

  it('a quien aún no publicó nada se lo dice y le ofrece publicar', async () => {
    // Arrange: cuenta sin anuncios

    // Act
    renderPage([])

    // Assert
    expect(await screen.findByRole('heading', { name: 'Aún no tienes anuncios' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Publicar una propiedad' })).toHaveAttribute('href', '/planes')
  })

  it('si no se pudieron leer lo dice, en lugar de afirmar que no hay ninguno', async () => {
    // Arrange
    getOwn.mockRejectedValue(new Error('sin conexión'))

    // Act
    renderWithRouter(<MyPropertiesPage />)

    // Assert
    expect(await screen.findByRole('heading', { level: 1, name: 'No pudimos cargar tus anuncios' })).toBeInTheDocument()
    expect(screen.queryByText('Aún no tienes anuncios')).not.toBeInTheDocument()
  })

  it('antes de eliminar un anuncio pide confirmarlo, diciendo cuál es y que no se puede deshacer', async () => {
    // Arrange
    renderPage()

    // Act
    const { dialog } = await askToDelete('Casa con jardín')

    // Assert
    expect(dialog.getByRole('heading', { name: '¿Eliminar este anuncio?' })).toBeInTheDocument()
    expect(dialog.getByText(/«Casa con jardín»/)).toHaveTextContent('No se puede deshacer.')
    expect(remove).not.toHaveBeenCalled()
  })

  it('al confirmarlo elimina ese anuncio y lo quita de la lista, sin tocar los demás', async () => {
    // Arrange
    remove.mockResolvedValue(undefined)
    renderPage()
    const { user, dialog } = await askToDelete('Casa con jardín')

    // Act
    await user.click(dialog.getByRole('button', { name: 'Eliminar anuncio' }))

    // Assert
    await waitFor(() => expect(ad('Casa con jardín')).not.toBeInTheDocument())
    expect(remove).toHaveBeenCalledExactlyOnceWith('casa-1')
    expect(ad('Terreno en Valle de Ángeles')).toBeInTheDocument()
  })

  it('si se cancela, no elimina nada', async () => {
    // Arrange
    renderPage()
    const { user, dialog } = await askToDelete('Casa con jardín')

    // Act
    await user.click(dialog.getByRole('button', { name: 'Cancelar' }))

    // Assert
    expect(remove).not.toHaveBeenCalled()
    expect(ad('Casa con jardín')).toBeInTheDocument()
  })

  it('si no se pudo eliminar lo avisa y el anuncio sigue en la lista', async () => {
    // Arrange
    remove.mockRejectedValue(new Error('sin conexión'))
    renderPage()
    const { user, dialog } = await askToDelete('Casa con jardín')

    // Act
    await user.click(dialog.getByRole('button', { name: 'Eliminar anuncio' }))

    // Assert
    expect(await dialog.findByRole('alert')).toHaveTextContent('No pudimos eliminar el anuncio')
    expect(ad('Casa con jardín')).toBeInTheDocument()
  })
})
