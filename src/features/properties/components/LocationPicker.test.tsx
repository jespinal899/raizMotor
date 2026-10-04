import { act, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import LocationPicker from '@/features/properties/components/LocationPicker'
import { COUNTRY_VIEW } from '@/features/properties/data/departments.data'
import type { Coordinates, MapView } from '@/features/properties/types/publication.types'
import { buildFakeLocationMap } from '@/test/fakeLocationMap'

const CORTES_VIEW: MapView = { center: { lat: 15.5042, lng: -88.025 }, zoom: 13 }

interface Overrides {
  view?: MapView
  value?: Coordinates | null
  error?: string
}

const setup = ({ view = COUNTRY_VIEW, value = null, error }: Overrides = {}) => {
  const fake = buildFakeLocationMap()
  const onChange = vi.fn()
  const renderPicker = (currentView: MapView) => (
    <LocationPicker view={currentView} value={value} onChange={onChange} error={error} createMap={fake.createMap} />
  )
  const { rerender, unmount } = render(renderPicker(view))

  return { fake, onChange, unmount, showView: (next: MapView) => rerender(renderPicker(next)) }
}

const mapElement = () => screen.getByRole('application', { name: 'Punto exacto en el mapa' })

describe('LocationPicker', () => {
  it('crea el mapa una sola vez en su contenedor y lo sitúa en la vista indicada', () => {
    // Arrange: vista de todo el país

    // Act
    const { fake } = setup()

    // Assert
    expect(fake.createMap).toHaveBeenCalledExactlyOnceWith(mapElement(), expect.anything())
    expect(fake.map.setView).toHaveBeenCalledExactlyOnceWith(COUNTRY_VIEW)
  })

  it('al cambiar la vista desplaza el mapa sin volver a crearlo', () => {
    // Arrange
    const { fake, showView } = setup()

    // Act
    showView(CORTES_VIEW)

    // Assert
    expect(fake.map.setView).toHaveBeenLastCalledWith(CORTES_VIEW)
    expect(fake.createMap).toHaveBeenCalledOnce()
  })

  it('no recoloca el mapa si la vista es la misma, para no deshacer lo que movió la persona', () => {
    // Arrange
    const { fake, showView } = setup({ view: CORTES_VIEW })

    // Act
    showView({ center: { ...CORTES_VIEW.center }, zoom: CORTES_VIEW.zoom })

    // Assert
    expect(fake.map.setView).toHaveBeenCalledOnce()
  })

  it('cuando la persona mueve el mapa avisa del punto que queda bajo el marcador', () => {
    // Arrange
    const point = { lat: 15.5, lng: -88.03 }
    const { fake, onChange } = setup()

    // Act
    act(() => fake.moveTo(point))

    // Assert
    expect(onChange).toHaveBeenCalledExactlyOnceWith(point)
  })

  it('sin punto marcado explica cómo marcarlo', () => {
    // Arrange
    const value = null

    // Act
    setup({ value })

    // Assert
    expect(screen.getByText('Arrastra el mapa hasta que el marcador quede sobre la propiedad.')).toBeInTheDocument()
  })

  it('con el punto marcado muestra sus coordenadas', () => {
    // Arrange
    const value = { lat: 14.0723, lng: -87.1921 }

    // Act
    setup({ value })

    // Assert
    expect(screen.getByText('Punto marcado: 14.07230, -87.19210')).toBeInTheDocument()
  })

  it('el mapa se puede alcanzar con el teclado', () => {
    // Arrange: mapa recién mostrado

    // Act
    setup()

    // Assert
    expect(mapElement()).toHaveAttribute('tabindex', '0')
  })

  it('con error, lo muestra y marca el mapa como inválido', () => {
    // Arrange
    const error = 'Mueve el mapa hasta dejar el marcador sobre la propiedad.'

    // Act
    setup({ error })

    // Assert
    expect(mapElement()).toHaveAttribute('aria-invalid', 'true')
    expect(mapElement()).toHaveAccessibleDescription(error)
  })

  it('al salir de la página destruye el mapa', () => {
    // Arrange
    const { fake, unmount } = setup()

    // Act
    unmount()

    // Assert
    expect(fake.map.destroy).toHaveBeenCalledOnce()
  })
})
