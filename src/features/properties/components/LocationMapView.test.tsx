import { act, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import LocationMapView from '@/features/properties/components/LocationMapView'
import type { MapView } from '@/features/properties/types/publication.types'
import { buildFakeLocationMap } from '@/test/fakeLocationMap'

const TEGUCIGALPA: MapView = { center: { lat: 14.0723, lng: -87.1921 }, zoom: 16 }
const SAN_PEDRO_SULA: MapView = { center: { lat: 15.5042, lng: -88.025 }, zoom: 14 }
const LABEL = 'Mapa para confirmar la dirección'

const setup = (view: MapView = TEGUCIGALPA) => {
  const fake = buildFakeLocationMap()
  const onMarkerMove = vi.fn()
  const renderMap = (current: MapView) => (
    <LocationMapView view={current} label={LABEL} onMarkerMove={onMarkerMove} createMap={fake.createMap} />
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

  it('con aviso de movimiento crea un mapa en el que el marcador se puede mover', () => {
    // Arrange: mapa para confirmar una dirección

    // Act
    const { fake } = setup()

    // Assert
    expect(fake.createMap).toHaveBeenCalledWith(mapElement(), expect.objectContaining({ onMarkerMove: expect.any(Function) }))
  })

  it('sin aviso de movimiento crea un mapa de solo consulta, con el marcador fijo', () => {
    // Arrange
    const fake = buildFakeLocationMap()

    // Act
    render(<LocationMapView view={TEGUCIGALPA} label={LABEL} createMap={fake.createMap} />)

    // Assert
    expect(fake.createMap).toHaveBeenCalledExactlyOnceWith(mapElement(), { markerLabel: 'Ubicación de la propiedad' })
    expect(fake.map.showPoint).toHaveBeenCalledExactlyOnceWith(TEGUCIGALPA)
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
