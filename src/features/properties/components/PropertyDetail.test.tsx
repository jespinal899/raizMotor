import { screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import PropertyDetail from '@/features/properties/components/PropertyDetail'
import { propertyViewService } from '@/features/properties/services/propertyViewService'
import type { Property } from '@/features/properties/types/property.types'
import { buildProperty } from '@/test/factories'
import { renderWithRouter } from '@/test/renderWithRouter'

vi.mock('@/features/properties/components/LocationMapView', () => ({
  default: ({ label, view }: { label: string; view: { center: { lat: number; lng: number } } }) => (
    <div role="application" aria-label={label}>
      Latitud {view.center.lat}; longitud {view.center.lng}
    </div>
  ),
}))

const textOf = (element: HTMLElement) => element.textContent?.replace(/\s+/g, ' ').trim()

const LOCATION = {
  department: 'Francisco Morazán',
  address: 'Avenida República de Chile, casa 12',
  coordinates: { lat: 14.1, lng: -87.19 },
}

describe('PropertyDetail', () => {
  // El contador de vistas tiene sus propias pruebas. Aquí no llega a responder: la ficha se comprueba al instante.
  beforeEach(() => {
    vi.spyOn(propertyViewService, 'registerView').mockReturnValue(new Promise(() => {}))
  })

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

  it('muestra la descripción y, entre las características destacadas, cada comodidad', () => {
    // Arrange
    const property = buildProperty({
      description: 'Una casa luminosa cerca del parque.',
      features: ['Piscina', 'Terraza', 'Cocina equipada'],
    })

    // Act
    renderWithRouter(<PropertyDetail property={property} />)

    // Assert
    expect(screen.getByText('Una casa luminosa cerca del parque.')).toBeInTheDocument()
    const features = screen.getByRole('region', { name: 'Características destacadas' })
    expect(within(features).getAllByRole('listitem').map(textOf)).toEqual(['Piscina', 'Terraza', 'Cocina equipada'])
  })

  it('a la derecha muestra el precio y quién publica', () => {
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
    expect(within(sidebar).getByText('Publicado por')).toBeInTheDocument()
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

  it('muestra la dirección, ambas superficies y el punto publicado en el mapa', async () => {
    // Arrange
    const property = {
      ...buildProperty({ features: [], advertiser: undefined }),
      builtArea: 180,
      landArea: 250,
      location: LOCATION,
    } as Property

    // Act
    renderWithRouter(<PropertyDetail property={property} />)

    // Assert
    expect(screen.getByText('Avenida República de Chile, casa 12')).toBeInTheDocument()
    expect(screen.getByText('Francisco Morazán')).toBeInTheDocument()
    const highlights = screen.getByRole('region', { name: 'Características destacadas' })
    expect(within(highlights).getByText('180 m²')).toBeInTheDocument()
    expect(within(highlights).getByText('250 m²')).toBeInTheDocument()
    expect(screen.queryByRole('region', { name: 'Superficies' })).not.toBeInTheDocument()
    expect(await screen.findByRole('application', { name: 'Mapa de la propiedad' })).toHaveTextContent(
      'Latitud 14.1; longitud -87.19',
    )
    expect(screen.queryByRole('heading', { name: 'Características' })).not.toBeInTheDocument()
    expect(screen.queryByText('Publicado por')).not.toBeInTheDocument()
  })

  it('avisa de que un anuncio local solo existe en este navegador', () => {
    // Arrange
    const property = buildProperty({ localOnly: true })

    // Act
    renderWithRouter(<PropertyDetail property={property} />)

    // Assert
    const note = screen.getByRole('note')
    expect(note).toHaveTextContent('Este anuncio solo está guardado en este navegador')
    expect(note).toHaveTextContent('Otras personas todavía no pueden verlo')
  })

  it('no muestra ese aviso en una propiedad del catálogo', () => {
    // Arrange
    const property = buildProperty()

    // Act
    renderWithRouter(<PropertyDetail property={property} />)

    // Assert
    expect(screen.queryByRole('note')).not.toBeInTheDocument()
  })

  it('destaca dormitorios, baños, estacionamientos y superficie con su nombre completo', () => {
    // Arrange
    const property = buildProperty({ bedrooms: 3, bathrooms: 3, parking: 2, area: 220 })

    // Act
    renderWithRouter(<PropertyDetail property={property} />)

    // Assert
    const highlights = screen.getByRole('region', { name: 'Características destacadas' })
    expect(within(highlights).getAllByRole('term').map(textOf)).toEqual([
      'Dormitorios',
      'Baños',
      'Estacionamientos',
      'Superficie',
    ])
    expect(within(highlights).getAllByRole('definition').map(textOf)).toEqual(['3', '3', '2', '220 m²'])
  })

  it('las características destacadas van justo debajo de las fotos, antes de la descripción', () => {
    // Arrange
    const property = buildProperty({ title: 'Casa con jardín' })

    // Act
    renderWithRouter(<PropertyDetail property={property} />)

    // Assert
    const photo = screen.getByRole('img', { name: /Casa con jardín, foto 1/ })
    const highlights = screen.getByRole('region', { name: 'Características destacadas' })
    const description = screen.getByRole('region', { name: 'Descripción' })
    expect(photo.compareDocumentPosition(highlights) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(highlights.compareDocumentPosition(description) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('no repite los datos de la propiedad en la columna derecha', () => {
    // Arrange
    const property = buildProperty({ bedrooms: 3, bathrooms: 2 })

    // Act
    renderWithRouter(<PropertyDetail property={property} />)

    // Assert
    const sidebar = screen.getByRole('complementary')
    expect(within(sidebar).queryByText(/dorm\./)).not.toBeInTheDocument()
    expect(within(sidebar).queryByText(/baños/)).not.toBeInTheDocument()
  })

  it('a la derecha ofrece compartir la ficha, cotizarla y contactar al anunciante', () => {
    // Arrange
    const property = buildProperty()

    // Act
    renderWithRouter(<PropertyDetail property={property} />)

    // Assert
    const sidebar = screen.getByRole('complementary')
    expect(within(sidebar).getByRole('button', { name: 'Compartir' })).toBeInTheDocument()
    expect(within(sidebar).getByRole('form', { name: 'Cotizar esta propiedad' })).toBeInTheDocument()
    expect(within(sidebar).getByRole('link', { name: 'Contactar al anunciante' })).toBeInTheDocument()
  })

  it('en la ubicación ofrece "Cómo llegar", que abre en Google Maps la ruta hasta el punto publicado', () => {
    // Arrange
    const property = buildProperty({ location: LOCATION })

    // Act
    renderWithRouter(<PropertyDetail property={property} />)

    // Assert
    const directions = within(screen.getByRole('region', { name: 'Ubicación' })).getByRole('link', {
      name: 'Cómo llegar',
    })
    const destination = new URL(directions.getAttribute('href') ?? '')
    expect(destination.origin + destination.pathname).toBe('https://www.google.com/maps/dir/')
    expect(destination.searchParams.get('destination')).toBe('14.1,-87.19')
    expect(directions).toHaveAttribute('target', '_blank')
    expect(directions).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('sin un punto publicado no ofrece "Cómo llegar": no hay destino que dar', () => {
    // Arrange
    const property = buildProperty({ location: undefined })

    // Act
    renderWithRouter(<PropertyDetail property={property} />)

    // Assert
    expect(screen.queryByRole('link', { name: 'Cómo llegar' })).not.toBeInTheDocument()
  })

  it('en un anuncio guardado en este navegador, dice a la derecha que lo publicó quien lo ve', () => {
    // Arrange
    const property = buildProperty({ advertiser: undefined, localOnly: true })

    // Act
    renderWithRouter(<PropertyDetail property={property} />)

    // Assert
    expect(within(screen.getByRole('complementary')).getByText('Tú')).toBeInTheDocument()
  })
})
