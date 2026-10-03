import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PropertyCollection from '@/features/properties/components/PropertyCollection'
import { buildProperty } from '@/test/factories'
import { renderWithRouter } from '@/test/renderWithRouter'

describe('PropertyCollection', () => {
  it('muestra el esqueleto de carga con la cantidad pedida', () => {
    // Arrange
    const skeletonCount = 4

    // Act
    renderWithRouter(<PropertyCollection properties={[]} isLoading skeletonCount={skeletonCount} />)

    // Assert
    const skeleton = screen.getByRole('list', { name: 'Cargando propiedades' })
    expect(skeleton).toHaveAttribute('aria-busy', 'true')
    expect(skeleton.children).toHaveLength(skeletonCount)
  })

  it('muestra un aviso cuando hay un error, aunque siga cargando', () => {
    // Arrange
    const error = new Error('API caída')

    // Act
    renderWithRouter(<PropertyCollection properties={[]} isLoading error={error} />)

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('No pudimos cargar las propiedades')
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('muestra el estado vacío cuando no hay propiedades', () => {
    // Arrange
    const emptyState = <p>Sin resultados</p>

    // Act
    renderWithRouter(<PropertyCollection properties={[]} isLoading={false} emptyState={emptyState} />)

    // Assert
    expect(screen.getByText('Sin resultados')).toBeInTheDocument()
  })

  it('muestra una tarjeta por cada propiedad', () => {
    // Arrange
    const properties = [
      buildProperty({ id: 'a', title: 'Casa A' }),
      buildProperty({ id: 'b', title: 'Casa B' }),
    ]

    // Act
    renderWithRouter(<PropertyCollection properties={properties} isLoading={false} />)

    // Assert
    const titles = screen.getAllByRole('heading').map((heading) => heading.textContent)
    expect(titles).toEqual(['Casa A', 'Casa B'])
  })
})
