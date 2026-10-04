import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import SearchResults from '@/features/search/components/SearchResults'
import type { Property } from '@/features/properties/types/property.types'
import { buildProperties } from '@/test/factories'
import { renderWithRouter } from '@/test/renderWithRouter'

const PAGE_SIZE = 6
const NO_PROPERTIES: Property[] = []

describe('SearchResults', () => {
  it('muestra el total cuando los resultados caben en una página', () => {
    // Arrange
    const properties = buildProperties(2)

    // Act
    renderWithRouter(
      <SearchResults properties={properties} total={2} page={1} pageSize={PAGE_SIZE} isLoading={false} />,
    )

    // Assert
    expect(screen.getByText('2 propiedades encontradas')).toBeInTheDocument()
  })

  it('cuenta un único resultado en singular', () => {
    // Arrange
    const properties = buildProperties(1)

    // Act
    renderWithRouter(
      <SearchResults properties={properties} total={1} page={1} pageSize={PAGE_SIZE} isLoading={false} />,
    )

    // Assert
    expect(screen.getByText('1 propiedad encontrada')).toBeInTheDocument()
  })

  it('indica qué tramo se está viendo cuando hay varias páginas', () => {
    // Arrange
    const lastPageProperties = buildProperties(5)

    // Act
    renderWithRouter(
      <SearchResults properties={lastPageProperties} total={11} page={2} pageSize={PAGE_SIZE} isLoading={false} />,
    )

    // Assert
    expect(screen.getByText('Mostrando 7–11 de 11 propiedades')).toBeInTheDocument()
  })

  it('muestra una tarjeta por cada propiedad de la página', () => {
    // Arrange
    const properties = buildProperties(3)

    // Act
    renderWithRouter(
      <SearchResults properties={properties} total={3} page={1} pageSize={PAGE_SIZE} isLoading={false} />,
    )

    // Assert
    const titles = screen.getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent)
    expect(titles).toEqual(['Propiedad 1', 'Propiedad 2', 'Propiedad 3'])
  })

  it('ofrece ver todas las propiedades cuando no hay resultados', () => {
    // Arrange
    const properties = NO_PROPERTIES

    // Act
    renderWithRouter(
      <SearchResults properties={properties} total={0} page={1} pageSize={PAGE_SIZE} isLoading={false} />,
    )

    // Assert
    expect(screen.getByText('No encontramos propiedades con esos filtros')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver todas las propiedades' })).toHaveAttribute('href', '/propiedades')
    expect(screen.queryByText(/encontrad|Mostrando/)).not.toBeInTheDocument()
  })

  it('mientras carga muestra un esqueleto del tamaño de la página, sin contador ni estado vacío', () => {
    // Arrange
    const properties = NO_PROPERTIES

    // Act
    renderWithRouter(<SearchResults properties={properties} total={0} page={1} pageSize={PAGE_SIZE} isLoading />)

    // Assert
    expect(screen.getByRole('list', { name: 'Cargando propiedades' }).children).toHaveLength(PAGE_SIZE)
    expect(screen.queryByText(/encontrad|Mostrando/)).not.toBeInTheDocument()
    expect(screen.queryByText('No encontramos propiedades con esos filtros')).not.toBeInTheDocument()
  })
})
