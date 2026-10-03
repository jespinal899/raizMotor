import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PropertyDetail from '@/features/properties/components/PropertyDetail'
import { buildProperty } from '@/test/factories'
import { renderWithRouter } from '@/test/renderWithRouter'

const textOf = (element: HTMLElement) => element.textContent?.replace(/\s+/g, ' ').trim()

describe('PropertyDetail', () => {
  it('muestra el título como encabezado principal, la ubicación y las etiquetas', () => {
    // Arrange
    const property = buildProperty({
      title: 'Casa con jardín',
      type: 'casa',
      operation: 'alquiler',
      district: 'Barranco',
      city: 'Lima',
    })

    // Act
    renderWithRouter(<PropertyDetail property={property} />)

    // Assert
    expect(screen.getByRole('heading', { level: 1, name: 'Casa con jardín' })).toBeInTheDocument()
    expect(screen.getByText('Barranco, Lima')).toBeInTheDocument()
    expect(screen.getByText('Alquiler')).toBeInTheDocument()
    expect(screen.getByText('Casa')).toBeInTheDocument()
  })

  it('la ruta de navegación lleva a inicio, propiedades y el tipo', () => {
    // Arrange
    const property = buildProperty({ title: 'Lote campestre', type: 'terreno' })

    // Act
    renderWithRouter(<PropertyDetail property={property} />)

    // Assert
    const breadcrumb = screen.getByRole('navigation', { name: 'Ruta de navegación' })
    const links = within(breadcrumb)
      .getAllByRole('link')
      .map((link) => `${link.textContent} → ${link.getAttribute('href')}`)
    expect(links).toEqual(['Inicio → /', 'Propiedades → /propiedades', 'Terrenos → /propiedades/terrenos'])
    expect(within(breadcrumb).getByText('Lote campestre')).toHaveAttribute('aria-current', 'page')
  })

  it('muestra la descripción y cada característica', () => {
    // Arrange
    const property = buildProperty({
      description: 'Una casa luminosa cerca del parque.',
      features: ['Piscina', 'Terraza', 'Cocina equipada'],
    })

    // Act
    renderWithRouter(<PropertyDetail property={property} />)

    // Assert
    expect(screen.getByText('Una casa luminosa cerca del parque.')).toBeInTheDocument()
    const features = screen.getByRole('region', { name: 'Características' })
    expect(within(features).getAllByRole('listitem').map(textOf)).toEqual(['Piscina', 'Terraza', 'Cocina equipada'])
  })

  it('muestra precio, datos con estacionamientos y quién publica', () => {
    // Arrange
    const property = buildProperty({
      price: 420000,
      bedrooms: 3,
      bathrooms: 3,
      parking: 2,
      area: 220,
      advertiser: { name: 'Inmobiliaria de prueba', kind: 'inmobiliaria' },
    })

    // Act
    renderWithRouter(<PropertyDetail property={property} />)

    // Assert
    const sidebar = screen.getByRole('complementary')
    expect(textOf(within(sidebar).getByText(/420,000/))).toBe('$ 420,000')
    expect(within(sidebar).getAllByRole('listitem').map(textOf)).toEqual(['3 dorm.', '3 baños', '2 estac.', '220 m²'])
    expect(within(sidebar).getByText('Inmobiliaria de prueba')).toBeInTheDocument()
    expect(within(sidebar).getByText('Inmobiliaria')).toBeInTheDocument()
  })

  it('el botón de contacto indica por qué propiedad se consulta', () => {
    // Arrange
    const property = buildProperty({ id: 'casa-123' })

    // Act
    renderWithRouter(<PropertyDetail property={property} />)

    // Assert
    expect(screen.getByRole('link', { name: 'Contactar al anunciante' })).toHaveAttribute(
      'href',
      '/contacto?propiedad=casa-123',
    )
  })

  it('usa las fotos de la galería', () => {
    // Arrange
    const property = buildProperty({
      title: 'Casa con jardín',
      gallery: ['https://example.com/a.jpg', 'https://example.com/b.jpg'],
    })

    // Act
    renderWithRouter(<PropertyDetail property={property} />)

    // Assert
    expect(screen.getByRole('img', { name: 'Casa con jardín, foto 1 de 2' })).toHaveAttribute(
      'src',
      'https://example.com/a.jpg',
    )
  })
})
