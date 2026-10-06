import { act, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import LocationMapView from '@/features/properties/components/LocationMapView'
import type { MapView } from '@/features/properties/types/publication.types'
import { buildFakeLocationMap } from '@/test/fakeLocationMap'

const TEGUCIGALPA: MapView = { center: { lat: 14.0723, lng: -87.1921 }, zoom: 16 }
const SAN_PEDRO_SULA: MapView = { center: { lat: 15.5042, lng: -88.025 }, zoom: 14 }
const LABEL = 'Mapa para confirmar la dirección'

const setup = (view: MapView = TEGUCIGALPA, interactive = true) => {
  const fake = buildFakeLocationMap()
  const onMarkerMove = vi.fn()
  const renderMap = (current: MapView) => (
    <LocationMapView
      view={current}
      label={LABEL}
      onMarkerMove={onMarkerMove}
      interactive={interactive}
      createMap={fake.createMap}
    />
  )
  const { rerender, unmount } = render(renderMap(view))

  return { fake, onMarkerMove, unmount, showView: (next: MapView) => rerender(renderMap(next)) }
}

const mapElement = () => screen.getByRole('application', { name: LABEL })

describe('LocationMapView', () => {
  it('crea el mapa una sola vez en su contenedor y muestra el punto indicado', () => {
    // Arrange: punto encontrado por el buscador

    // Act
    const { fake } = setup()

    // Assert
    expect(fake.createMap).toHaveBeenCalledExactlyOnceWith(mapElement(), expect.anything())
    expect(fake.map.showPoint).toHaveBeenCalledExactlyOnceWith(TEGUCIGALPA)
  })

  it('al cambiar el punto lo muestra sin volver a crear el mapa', () => {
    // Arrange
    const { fake, showView } = setup()

    // Act
    showView(SAN_PEDRO_SULA)

    // Assert
    expect(fake.map.showPoint).toHaveBeenLastCalledWith(SAN_PEDRO_SULA)
    expect(fake.createMap).toHaveBeenCalledOnce()
  })

  it('no recoloca el marcador si el punto es el mismo, para no deshacer lo que movió la persona', () => {
    // Arrange
    const { fake, showView } = setup()

    // Act
    showView({ center: { ...TEGUCIGALPA.center }, zoom: TEGUCIGALPA.zoom })

    // Assert
    expect(fake.map.showPoint).toHaveBeenCalledOnce()
  })

  it('cuando la persona mueve el marcador avisa del punto nuevo', () => {
    // Arrange
    const point = { lat: 14.08, lng: -87.2 }
    const { fake, onMarkerMove } = setup()

    // Act
    act(() => fake.moveMarkerTo(point))

    // Assert
    expect(onMarkerMove).toHaveBeenCalledExactlyOnceWith(point)
  })

  it('el mapa se puede alcanzar con el teclado', () => {
    // Arrange: mapa recién mostrado

    // Act
    setup()

    // Assert
    expect(mapElement()).toHaveAttribute('tabindex', '0')
  })

  it('indica al servicio que no debe permitir cambios en el mapa de la ficha', () => {
    // Arrange
    const { fake } = setup(TEGUCIGALPA, false)

    // Act: el mapa se crea al mostrar la vista

    // Assert
    expect(fake.createMap).toHaveBeenCalledWith(mapElement(), expect.objectContaining({ interactive: false }))
  })

  it('al dejar de mostrarse destruye el mapa', () => {
    // Arrange
    const { fake, unmount } = setup()

    // Act
    unmount()

    // Assert
    expect(fake.map.destroy).toHaveBeenCalledOnce()
  })
})
