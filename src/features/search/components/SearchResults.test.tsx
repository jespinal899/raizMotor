import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import SearchResults from '@/features/search/components/SearchResults'
import { buildProperty } from '@/test/factories'
import { renderWithRouter } from '@/test/renderWithRouter'

describe('SearchResults', () => {
  it('cuenta los resultados en plural', () => {
    // Arrange
    const properties = [buildProperty({ id: 'a' }), buildProperty({ id: 'b' })]

    // Act
    renderWithRouter(<SearchResults properties={properties} isLoading={false} />)

    // Assert
    expect(screen.getByText('2 propiedades encontradas')).toBeInTheDocument()
  })

  it('cuenta un único resultado en singular', () => {
    // Arrange
    const properties = [buildProperty()]

    // Act
    renderWithRouter(<SearchResults properties={properties} isLoading={false} />)

    // Assert
    expect(screen.getByText('1 propiedad encontrada')).toBeInTheDocument()
  })

  it('ofrece ver todas las propiedades cuando no hay resultados', () => {
    // Arrange
    const properties = [] as never[]

    // Act
    renderWithRouter(<SearchResults properties={properties} isLoading={false} />)

    // Assert
    expect(screen.getByText('No encontramos propiedades con esos filtros')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver todas las propiedades' })).toHaveAttribute('href', '/propiedades')
    expect(screen.queryByText(/encontrad/)).not.toBeInTheDocument()
  })

  it('no muestra el contador ni el estado vacío mientras carga', () => {
    // Arrange
    const properties = [] as never[]

    // Act
    renderWithRouter(<SearchResults properties={properties} isLoading />)

    // Assert
    expect(screen.queryByText(/encontrad/)).not.toBeInTheDocument()
    expect(screen.queryByText('No encontramos propiedades con esos filtros')).not.toBeInTheDocument()
  })
})
