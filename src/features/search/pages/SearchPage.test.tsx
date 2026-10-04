import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { propertyService } from '@/features/properties/services/propertyService'
import type { PropertyFilters } from '@/features/properties/types/property.types'
import SearchPage from '@/features/search/pages/SearchPage'
import { BRAND } from '@/shared/constants/brand'
import type { PageRequest } from '@/shared/types/common.types'
import { paginate } from '@/shared/utils/pagination'
import { buildProperties } from '@/test/factories'
import { renderWithRouter } from '@/test/renderWithRouter'

vi.mock('@/features/properties/services/propertyService', () => ({
  propertyService: { getFeatured: vi.fn(), search: vi.fn(), getById: vi.fn() },
}))

const search = vi.mocked(propertyService.search)

/** El servicio falso pagina un catálogo de `count` propiedades, como haría la API. */
const givenCatalogOf = (count: number) => {
  const catalog = buildProperties(count)
  search.mockImplementation(async (_filters: PropertyFilters, request: PageRequest) => paginate(catalog, request))
}

const renderPage = (route: string) => renderWithRouter(<SearchPage />, { route, path: '/propiedades/:tipo?' })

const cardTitles = () => screen.getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent)

const pagination = () => screen.getByRole('navigation', { name: 'Paginación' })

describe('SearchPage', () => {
  beforeEach(() => {
    search.mockReset()
  })

  it('muestra la primera página del catálogo y pide solo seis propiedades', async () => {
    // Arrange
    givenCatalogOf(11)

    // Act
    renderPage('/propiedades')

    // Assert
    expect(await screen.findByText('Mostrando 1–6 de 11 propiedades')).toBeInTheDocument()
    expect(cardTitles()).toEqual(['Propiedad 1', 'Propiedad 2', 'Propiedad 3', 'Propiedad 4', 'Propiedad 5', 'Propiedad 6'])
    expect(search).toHaveBeenCalledWith({}, { page: 1, pageSize: 6 })
  })

  it('ofrece tantas páginas como hagan falta para el catálogo', async () => {
    // Arrange
    givenCatalogOf(14)

    // Act
    renderPage('/propiedades')

    // Assert
    await screen.findByText('Mostrando 1–6 de 14 propiedades')
    const pages = within(pagination())
      .getAllByRole('link', { name: /^Página \d+$/ })
      .map((link) => link.textContent)
    expect(pages).toEqual(['1', '2', '3'])
  })

  it('muestra la página indicada en la URL', async () => {
    // Arrange
    givenCatalogOf(11)

    // Act
    renderPage('/propiedades?pagina=2')

    // Assert
    expect(await screen.findByText('Mostrando 7–11 de 11 propiedades')).toBeInTheDocument()
    expect(cardTitles()).toEqual(['Propiedad 7', 'Propiedad 8', 'Propiedad 9', 'Propiedad 10', 'Propiedad 11'])
    expect(within(pagination()).getByRole('link', { name: 'Página 2' })).toHaveAttribute('aria-current', 'page')
    await waitFor(() => expect(document.title).toBe(`Propiedades, página 2 | ${BRAND.name}`))
  })

  it('los enlaces de página conservan los filtros de la búsqueda', async () => {
    // Arrange
    givenCatalogOf(11)

    // Act
    renderPage('/propiedades/casas?operacion=venta')

    // Assert
    await screen.findByText('Mostrando 1–6 de 11 propiedades')
    expect(within(pagination()).getByRole('link', { name: 'Página 2' })).toHaveAttribute(
      'href',
      '/propiedades/casas?operacion=venta&pagina=2',
    )
    expect(within(pagination()).getByRole('link', { name: 'Página 1' })).toHaveAttribute(
      'href',
      '/propiedades/casas?operacion=venta',
    )
  })

  it('al pulsar una página navega a ella y muestra sus propiedades', async () => {
    // Arrange
    const user = userEvent.setup()
    givenCatalogOf(11)
    const { currentPath } = renderPage('/propiedades')
    await screen.findByText('Mostrando 1–6 de 11 propiedades')

    // Act
    await user.click(within(pagination()).getByRole('link', { name: 'Página siguiente' }))

    // Assert
    expect(await screen.findByText('Mostrando 7–11 de 11 propiedades')).toBeInTheDocument()
    expect(currentPath()).toBe('/propiedades?pagina=2')
    expect(cardTitles()[0]).toBe('Propiedad 7')
  })

  it('no muestra paginación cuando el catálogo cabe en una página', async () => {
    // Arrange
    givenCatalogOf(4)

    // Act
    renderPage('/propiedades')

    // Assert
    expect(await screen.findByText('4 propiedades encontradas')).toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Paginación' })).not.toBeInTheDocument()
  })

  it('una página mayor que el máximo muestra la última', async () => {
    // Arrange
    givenCatalogOf(11)

    // Act
    renderPage('/propiedades?pagina=99')

    // Assert
    expect(await screen.findByText('Mostrando 7–11 de 11 propiedades')).toBeInTheDocument()
    expect(within(pagination()).getByRole('link', { name: 'Página 2' })).toHaveAttribute('aria-current', 'page')
  })

  it('al buscar con otros filtros se vuelve a la primera página', async () => {
    // Arrange
    const user = userEvent.setup()
    givenCatalogOf(11)
    const { currentPath } = renderPage('/propiedades?pagina=2')
    await screen.findByText('Mostrando 7–11 de 11 propiedades')

    // Act
    await user.type(screen.getByRole('textbox', { name: 'Ubicación' }), 'Lima{Enter}')

    // Assert
    expect(await screen.findByText('Mostrando 1–6 de 11 propiedades')).toBeInTheDocument()
    expect(currentPath()).toBe('/propiedades?ubicacion=Lima')
  })
})
