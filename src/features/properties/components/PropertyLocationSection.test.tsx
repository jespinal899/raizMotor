import { render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import PropertyLocationSection from '@/features/properties/components/PropertyLocationSection'

vi.mock('@/features/properties/components/LocationMapView', () => ({
  default: ({ label, view }: { label: string; view: { center: { lat: number; lng: number }; zoom: number } }) => (
    <div role="application" aria-label={label}>
      Latitud {view.center.lat}; longitud {view.center.lng}; zoom {view.zoom}
    </div>
  ),
}))

const LOCATION = {
  department: 'Cortés',
  address: '10 calle, casa 25',
  coordinates: { lat: 15.498464, lng: -88.0436708 },
}

const renderSection = () =>
  render(<PropertyLocationSection location={LOCATION} district="Colonia Trejo" city="San Pedro Sula" />)

const section = () => screen.getByRole('region', { name: 'Ubicación' })
const textOf = (element: HTMLElement) => element.textContent?.replace(/\s+/g, ' ').trim()

describe('PropertyLocationSection', () => {
  it('dice la dirección, la colonia con su ciudad y el departamento', () => {
    // Arrange: propiedad con su dirección confirmada

    // Act
    renderSection()

    // Assert
    const address = within(section()).getByText('10 calle, casa 25').closest('address') as HTMLElement
    expect([...address.children].map((line) => textOf(line as HTMLElement))).toEqual([
      '10 calle, casa 25',
      'Colonia Trejo, San Pedro Sula',
      'Cortés',
    ])
  })

  it('ofrece "Cómo llegar", que abre en Google Maps la ruta hasta el punto de la propiedad', () => {
    // Arrange: propiedad con su punto en el mapa

    // Act
    renderSection()

    // Assert
    const directions = within(section()).getByRole('link', { name: 'Cómo llegar' })
    const destination = new URL(directions.getAttribute('href') ?? '')
    expect(destination.origin + destination.pathname).toBe('https://www.google.com/maps/dir/')
    expect(destination.searchParams.get('destination')).toBe('15.498464,-88.0436708')
    expect(directions).toHaveAttribute('target', '_blank')
  })

  it('muestra el punto de la propiedad en el mapa', async () => {
    // Arrange: propiedad con su punto en el mapa

    // Act
    renderSection()

    // Assert
    const map = await within(section()).findByRole('application', { name: 'Mapa de la propiedad' })
    expect(map).toHaveTextContent('Latitud 15.498464; longitud -88.0436708; zoom 15')
  })

  it('la dirección y "Cómo llegar" comparten una fila, y el mapa va debajo en el mismo bloque', async () => {
    // Arrange: propiedad con su punto en el mapa

    // Act
    renderSection()

    // Assert
    const map = await within(section()).findByRole('application', { name: 'Mapa de la propiedad' })
    const directions = within(section()).getByRole('link', { name: 'Cómo llegar' })
    const address = within(section()).getByText('10 calle, casa 25').closest('address')
    expect(directions.parentElement).toBe(address?.parentElement)
    expect(directions.parentElement).not.toContainElement(map)
    expect(directions.compareDocumentPosition(map)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    expect(within(section()).getByRole('heading', { level: 2, name: 'Ubicación' }).parentElement).toContainElement(map)
  })
})
