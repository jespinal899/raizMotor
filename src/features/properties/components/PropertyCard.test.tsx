import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PropertyCard from '@/features/properties/components/PropertyCard'
import { buildImageFile, buildProperty } from '@/test/factories'
import { renderWithRouter } from '@/test/renderWithRouter'

const textOf = (element: HTMLElement) => element.textContent?.replace(/\s+/g, ' ').trim()

describe('PropertyCard', () => {
  it('muestra título, precio y ubicación', () => {
    // Arrange
    const property = buildProperty({
      title: 'Casa con jardín',
      price: 420000,
      district: 'Miraflores',
      city: 'Lima',
    })

    // Act
    renderWithRouter(<PropertyCard property={property} />)

    // Assert
    expect(screen.getByRole('heading', { name: 'Casa con jardín' })).toBeInTheDocument()
    expect(textOf(screen.getByText(/420,000/))).toBe('$ 420,000')
    expect(screen.getByText('Miraflores, Lima')).toBeInTheDocument()
  })

  it('enlaza toda la tarjeta al detalle de la propiedad', () => {
    // Arrange
    const property = buildProperty({ id: 'casa-123', title: 'Casa con jardín' })

    // Act
    renderWithRouter(<PropertyCard property={property} />)

    // Assert
    expect(screen.getByRole('link', { name: 'Casa con jardín' })).toHaveAttribute('href', '/propiedad/casa-123')
  })

  it('indica que el precio es mensual cuando es un alquiler', () => {
    // Arrange
    const property = buildProperty({ operation: 'alquiler', price: 850 })

    // Act
    renderWithRouter(<PropertyCard property={property} />)

    // Assert
    expect(textOf(screen.getByText(/850/))).toBe('$ 850 / mes')
    expect(screen.getByText('Alquiler')).toBeInTheDocument()
  })

  it('no menciona "mes" en una venta', () => {
    // Arrange
    const property = buildProperty({ operation: 'venta' })

    // Act
    renderWithRouter(<PropertyCard property={property} />)

    // Assert
    expect(screen.queryByText(/mes/)).not.toBeInTheDocument()
    expect(screen.getByText('Venta')).toBeInTheDocument()
  })

  it('muestra dormitorios, baños y área', () => {
    // Arrange
    const property = buildProperty({ bedrooms: 3, bathrooms: 2, area: 180 })

    // Act
    renderWithRouter(<PropertyCard property={property} />)

    // Assert
    const stats = screen.getAllByRole('listitem').map(textOf)
    expect(stats).toEqual(['3 dorm.', '2 baños', '180 m²'])
  })

  it('usa el singular cuando hay un solo baño', () => {
    // Arrange
    const property = buildProperty({ bathrooms: 1 })

    // Act
    renderWithRouter(<PropertyCard property={property} />)

    // Assert
    expect(screen.getByText(/1 baño$/)).toBeInTheDocument()
  })

  it('omite dormitorios y baños en un terreno', () => {
    // Arrange
    const property = buildProperty({ type: 'terreno', bedrooms: undefined, bathrooms: undefined, area: 1000 })

    // Act
    renderWithRouter(<PropertyCard property={property} />)

    // Assert
    const stats = screen.getAllByRole('listitem').map(textOf)
    expect(stats).toEqual(['1,000 m²'])
    expect(screen.getByText('Terreno')).toBeInTheDocument()
  })

  it('usa de portada la foto guardada en este navegador', () => {
    // Arrange
    const property = buildProperty({ image: buildImageFile({ name: 'portada.jpg' }) })

    // Act
    const { container } = renderWithRouter(<PropertyCard property={property} />)

    // Assert
    expect(container.querySelector('img')).toHaveAttribute('src', 'blob:portada.jpg')
  })
})
