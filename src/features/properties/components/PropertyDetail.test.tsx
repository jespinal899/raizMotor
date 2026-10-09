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

  it('muestra el título como encabezado principal y, debajo, la ubicación', () => {
    // Arrange
    const property = buildProperty({ title: 'Casa con jardín', district: 'Barranco', city: 'Lima' })

    // Act
    renderWithRouter(<PropertyDetail property={property} />)

    // Assert
    const title = screen.getByRole('heading', { level: 1, name: 'Casa con jardín' })
    const location = screen.getByText('Barranco, Lima')
    expect(title.compareDocumentPosition(location) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('el título encabeza la ficha: no lleva encima las etiquetas de operación y tipo', () => {
    // Arrange
    const property = buildProperty({ title: 'Casa con jardín', type: 'casa', operation: 'alquiler' })

    // Act
    renderWithRouter(<PropertyDetail property={property} />)

    // Assert
    const header = screen.getByRole('heading', { level: 1, name: 'Casa con jardín' }).parentElement
    expect(header?.firstElementChild).toBe(screen.getByRole('heading', { level: 1 }))
    expect(screen.queryByText('Alquiler')).not.toBeInTheDocument()
    expect(screen.queryByText('Casa')).not.toBeInTheDocument()
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

  it('la descripción se lee en los párrafos que escribió quien publica, no en uno solo', () => {
    // Arrange
    const property = buildProperty({
      description: 'Casa de dos plantas con patio amplio.\n\nQueda a dos cuadras del parque.\n\n\nPrecio negociable.',
    })

    // Act
    renderWithRouter(<PropertyDetail property={property} />)

    // Assert
    const description = screen.getByRole('region', { name: 'Descripción' })
    expect(within(description).getAllByRole('paragraph').map((paragraph) => paragraph.textContent)).toEqual([
      'Casa de dos plantas con patio amplio.',
      'Queda a dos cuadras del parque.',
      'Precio negociable.',
    ])
  })

  it('la descripción conserva los saltos de línea de dentro de un párrafo', () => {
    // Arrange
    const property = buildProperty({ description: 'Incluye:\n- Cocina equipada\n- Patio techado' })

    // Act
    renderWithRouter(<PropertyDetail property={property} />)

    // Assert
    const paragraph = within(screen.getByRole('region', { name: 'Descripción' })).getByRole('paragraph')
    expect(paragraph.textContent).toBe('Incluye:\n- Cocina equipada\n- Patio techado')
    // El salto está en el texto; es esta regla la que hace que el navegador lo pinte en lugar de juntarlo.
    expect(paragraph).toHaveClass('whitespace-pre-line')
  })

  it('bajo el título y la ubicación, antes de las fotos, dice el precio con "Desde"', () => {
    // Arrange
    const property = buildProperty({ title: 'Casa con jardín', price: 420000, operation: 'venta' })

    // Act
    renderWithRouter(<PropertyDetail property={property} />)

    // Assert
    const price = screen.getByText(/420,000/).closest('p') as HTMLElement
    const follows = (first: HTMLElement, second: HTMLElement) =>
      Boolean(first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING)
    expect(textOf(price)).toBe('Desde $ 420,000')
    expect(follows(screen.getByText('Miraflores, Lima'), price)).toBe(true)
    expect(follows(price, screen.getByRole('img', { name: /Casa con jardín, foto 1/ }))).toBe(true)
  })

  it('en un alquiler, el precio de la ficha aclara que es por mes', () => {
    // Arrange
    const property = buildProperty({ price: 850, operation: 'alquiler' })

    // Act
    renderWithRouter(<PropertyDetail property={property} />)

    // Assert
    expect(textOf(screen.getByText(/850/).closest('p') as HTMLElement)).toBe('Desde $ 850 / mes')
  })

  it('el precio se dice una sola vez: la columna derecha ya no lo repite', () => {
    // Arrange
    const property = buildProperty({ price: 420000 })

    // Act
    renderWithRouter(<PropertyDetail property={property} />)

    // Assert
    expect(screen.getAllByText(/420,000/)).toHaveLength(1)
    expect(within(screen.getByRole('complementary')).queryByText(/420,000/)).not.toBeInTheDocument()
  })

  it('a la derecha muestra quién publica', () => {
    // Arrange
    const property = buildProperty({ advertiser: { name: 'Inmobiliaria de prueba', kind: 'inmobiliaria' } })

    // Act
    renderWithRouter(<PropertyDetail property={property} />)

    // Assert
    const sidebar = screen.getByRole('complementary')
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

  it('la ficha de un anuncio guardado en este navegador se ve como cualquier otra, sin aviso bajo el título', () => {
    // Arrange
    const property = buildProperty({ localOnly: true })

    // Act
    renderWithRouter(<PropertyDetail property={property} />)

    // Assert
    expect(screen.queryByRole('note')).not.toBeInTheDocument()
    expect(screen.queryByText('Este anuncio solo está guardado en este navegador')).not.toBeInTheDocument()
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

  it('a la derecha ofrece cotizar la propiedad y contactar al anunciante', () => {
    // Arrange
    const property = buildProperty()

    // Act
    renderWithRouter(<PropertyDetail property={property} />)

    // Assert
    const sidebar = screen.getByRole('complementary')
    expect(within(sidebar).getByRole('form', { name: 'Cotizar esta propiedad' })).toBeInTheDocument()
    expect(within(sidebar).getByRole('link', { name: 'Contactar al anunciante' })).toBeInTheDocument()
  })

  it('junto a la ruta de navegación, antes del título, van compartir y reportar', () => {
    // Arrange
    const property = buildProperty({ title: 'Casa con jardín' })

    // Act
    renderWithRouter(<PropertyDetail property={property} />)

    // Assert
    const actions = screen.getByRole('group', { name: 'Acciones de la ficha' })
    const breadcrumb = screen.getByRole('navigation', { name: 'Ruta de navegación' })
    const title = screen.getByRole('heading', { level: 1, name: 'Casa con jardín' })
    expect(within(actions).getByRole('button', { name: 'Compartir' })).toBeInTheDocument()
    expect(within(actions).getByRole('button', { name: 'Reportar' })).toBeInTheDocument()
    expect(breadcrumb.parentElement).toBe(actions.parentElement)
    expect(actions.compareDocumentPosition(title) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('compartir ya no está en la columna derecha: va con las acciones de arriba', () => {
    // Arrange
    const property = buildProperty()

    // Act
    renderWithRouter(<PropertyDetail property={property} />)

    // Assert
    const sidebar = screen.getByRole('complementary')
    expect(within(sidebar).queryByRole('button', { name: 'Compartir' })).not.toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Compartir' })).toHaveLength(1)
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

  it('la ubicación va bajo las dos columnas de la ficha, a lo ancho de ambas, con su mapa dentro', async () => {
    // Arrange
    const property = buildProperty({ location: LOCATION })

    // Act
    renderWithRouter(<PropertyDetail property={property} />)

    // Assert
    const location = screen.getByRole('region', { name: 'Ubicación' })
    const map = await within(location).findByRole('application', { name: 'Mapa de la propiedad' })
    const columns = screen.getByRole('complementary').parentElement
    expect(screen.getByRole('article')).toContainElement(location)
    expect(columns).toContainElement(screen.getByRole('region', { name: 'Descripción' }))
    expect(columns).not.toContainElement(location)
    expect(location).toContainElement(map)
    expect(screen.getByRole('region', { name: 'Descripción' }).compareDocumentPosition(location)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    )
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
