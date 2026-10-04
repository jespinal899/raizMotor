import { screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Pagination from '@/components/Pagination'
import { renderWithRouter } from '@/test/renderWithRouter'

const getPageHref = (page: number) => `/catalogo?pagina=${page}`

const renderPagination = (currentPage: number, totalPages: number) =>
  renderWithRouter(<Pagination currentPage={currentPage} totalPages={totalPages} getPageHref={getPageHref} />)

const pageLinks = () =>
  screen.getAllByRole('link', { name: /^Página \d+$/ }).map((link) => `${link.textContent} → ${link.getAttribute('href')}`)

describe('Pagination', () => {
  it('no se muestra cuando todo cabe en una página', () => {
    // Arrange
    const totalPages = 1

    // Act
    renderPagination(1, totalPages)

    // Assert
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })

  it('enlaza cada página, del 1 al máximo', () => {
    // Arrange
    const totalPages = 4

    // Act
    renderPagination(1, totalPages)

    // Assert
    expect(pageLinks()).toEqual([
      '1 → /catalogo?pagina=1',
      '2 → /catalogo?pagina=2',
      '3 → /catalogo?pagina=3',
      '4 → /catalogo?pagina=4',
    ])
  })

  it('marca solo la página actual', () => {
    // Arrange
    const currentPage = 3

    // Act
    renderPagination(currentPage, 4)

    // Assert
    const current = screen.getAllByRole('link').filter((link) => link.getAttribute('aria-current') === 'page')
    expect(current.map((link) => link.textContent)).toEqual(['3'])
  })

  it('"Anterior" y "Siguiente" llevan a las páginas vecinas', () => {
    // Arrange
    const currentPage = 2

    // Act
    renderPagination(currentPage, 4)

    // Assert
    expect(screen.getByRole('link', { name: 'Página anterior' })).toHaveAttribute('href', '/catalogo?pagina=1')
    expect(screen.getByRole('link', { name: 'Página siguiente' })).toHaveAttribute('href', '/catalogo?pagina=3')
  })

  it('en la primera página "Anterior" está deshabilitado y no enlaza a ningún sitio', () => {
    // Arrange
    const currentPage = 1

    // Act
    renderPagination(currentPage, 4)

    // Assert
    const previous = screen.getByRole('link', { name: 'Página anterior' })
    expect(previous).toHaveAttribute('aria-disabled', 'true')
    expect(previous).not.toHaveAttribute('href')
    expect(screen.getByRole('link', { name: 'Página siguiente' })).toHaveAttribute('href', '/catalogo?pagina=2')
  })

  it('en la última página "Siguiente" está deshabilitado', () => {
    // Arrange
    const currentPage = 4

    // Act
    renderPagination(currentPage, 4)

    // Assert
    const next = screen.getByRole('link', { name: 'Página siguiente' })
    expect(next).toHaveAttribute('aria-disabled', 'true')
    expect(next).not.toHaveAttribute('href')
  })

  it('con muchas páginas resume los saltos con puntos suspensivos', () => {
    // Arrange
    const currentPage = 10

    // Act
    renderPagination(currentPage, 20)

    // Assert
    expect(pageLinks().map((link) => link.split(' ')[0])).toEqual(['1', '9', '10', '11', '20'])
    const navigation = screen.getByRole('navigation', { name: 'Paginación' })
    expect(within(navigation).getAllByRole('listitem', { hidden: true })).toHaveLength(9)
  })

  it('pide la dirección de cada página a quien lo usa', () => {
    // Arrange
    const buildHref = vi.fn(getPageHref)

    // Act
    renderWithRouter(<Pagination currentPage={1} totalPages={3} getPageHref={buildHref} />)

    // Assert
    expect(buildHref.mock.calls.map(([page]) => page).sort()).toEqual([1, 2, 2, 3])
  })
})
