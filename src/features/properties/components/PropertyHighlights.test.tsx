import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PropertyHighlights from '@/features/properties/components/PropertyHighlights'
import { buildProperty } from '@/test/factories'

const section = () => screen.getByRole('region', { name: 'Características destacadas' })
const textOf = (element: HTMLElement) => element.textContent?.replace(/\s+/g, ' ').trim()

describe('PropertyHighlights', () => {
  it('muestra cada dato de la propiedad con su nombre y su valor', () => {
    // Arrange
    const property = buildProperty({ bedrooms: 3, bathrooms: 2, parking: undefined, builtArea: 180, landArea: 250 })

    // Act
    render(<PropertyHighlights property={property} />)

    // Assert
    expect(within(section()).getAllByRole('term').map(textOf)).toEqual([
      'Dormitorios',
      'Baños',
      'Superficie construida',
      'Superficie del terreno',
    ])
    expect(within(section()).getAllByRole('definition').map(textOf)).toEqual(['3', '2', '180 m²', '250 m²'])
  })

  it('lista también las comodidades de la propiedad', () => {
    // Arrange
    const property = buildProperty({ features: ['Piscina', 'Terraza', 'Cocina equipada'] })

    // Act
    render(<PropertyHighlights property={property} />)

    // Assert
    expect(within(section()).getAllByRole('listitem').map(textOf)).toEqual(['Piscina', 'Terraza', 'Cocina equipada'])
  })

  it('sin comodidades no deja una lista vacía', () => {
    // Arrange
    const property = buildProperty({ features: [] })

    // Act
    render(<PropertyHighlights property={property} />)

    // Assert
    expect(within(section()).queryByRole('list')).not.toBeInTheDocument()
  })

  it('los iconos son un adorno: los lectores de pantalla solo leen los nombres y los valores', () => {
    // Arrange
    const property = buildProperty()

    // Act
    render(<PropertyHighlights property={property} />)

    // Assert
    const icons = [...section().querySelectorAll('svg')]
    expect(icons.length).toBeGreaterThan(0)
    expect(icons.every((icon) => icon.getAttribute('aria-hidden') === 'true')).toBe(true)
  })
})
