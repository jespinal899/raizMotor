import { fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { chooseMapTiles, createLeafletLocationMap } from '@/features/properties/services/locationMap'

const TEGUCIGALPA = { center: { lat: 14.0723, lng: -87.1921 }, zoom: 13 }
const SAN_PEDRO_SULA = { center: { lat: 15.5042, lng: -88.025 }, zoom: 13 }
const MARKER_LABEL = 'Ubicación de la propiedad'
/** Leaflet 1.9 lee el `keyCode` heredado, que `user-event` no rellena: la tecla se envía con él. */
const ARROW_RIGHT = { key: 'ArrowRight', keyCode: 39 }

/** Leaflet reacciona al cambio de tamaño en el siguiente fotograma y avisa del movimiento 200 ms después. */
const LEAFLET_RESIZE_WAIT = 400

/** jsdom no calcula tamaños: se simula el que tendría el contenedor tras redimensionar la ventana. */
const resizeWindow = async (container: HTMLElement, size: { width: number; height: number }) => {
  Object.defineProperty(container, 'clientWidth', { configurable: true, value: size.width })
  Object.defineProperty(container, 'clientHeight', { configurable: true, value: size.height })
  window.dispatchEvent(new Event('resize'))
  await new Promise((resolve) => setTimeout(resolve, LEAFLET_RESIZE_WAIT))
}

const setup = () => {
  const container = document.body.appendChild(document.createElement('div'))
  const onMarkerMove = vi.fn()
  const map = createLeafletLocationMap(container, { markerLabel: MARKER_LABEL, onMarkerMove })
  map.showPoint(TEGUCIGALPA)
  const marker = () => container.querySelector<HTMLElement>('.leaflet-marker-icon')

  return { container, onMarkerMove, map, marker }
}

describe('createLeafletLocationMap', () => {
  afterEach(() => {
    document.body.replaceChildren()
  })

  it('al mostrar un punto coloca un único marcador con nombre, que se puede alcanzar con el teclado', () => {
    // Arrange
    const { container, map, marker } = setup()

    // Act
    map.showPoint(SAN_PEDRO_SULA)

    // Assert
    expect(container.querySelectorAll('.leaflet-marker-icon')).toHaveLength(1)
    expect(marker()).toHaveAttribute('title', MARKER_LABEL)
    expect(marker()).toHaveAttribute('tabindex', '0')
  })

  it('mostrar un punto por código no cuenta como un movimiento de la persona', () => {
    // Arrange
    const { map, onMarkerMove } = setup()

    // Act
    map.showPoint(SAN_PEDRO_SULA)

    // Assert
    expect(onMarkerMove).not.toHaveBeenCalled()
  })

  it('un clic en el mapa lleva el marcador a ese punto y lo avisa', () => {
    // Arrange
    const { container, onMarkerMove } = setup()

    // Act
    fireEvent.click(container, { clientX: 120, clientY: 80 })

    // Assert
    expect(onMarkerMove).toHaveBeenCalledOnce()
    const [point] = onMarkerMove.mock.calls[0]
    expect(point.lng).toBeGreaterThan(TEGUCIGALPA.center.lng)
    expect(point.lat).toBeLessThan(TEGUCIGALPA.center.lat)
  })

  it('al desplazar el mapa con las flechas, el marcador lo acompaña en el centro y lo avisa', () => {
    // Arrange
    const { container, onMarkerMove } = setup()
    container.focus()

    // Act
    fireEvent.keyDown(container, ARROW_RIGHT)

    // Assert
    expect(onMarkerMove).toHaveBeenCalledOnce()
    const [point] = onMarkerMove.mock.calls[0]
    expect(point.lat).toBeCloseTo(TEGUCIGALPA.center.lat, 3)
    expect(point.lng).toBeGreaterThan(TEGUCIGALPA.center.lng)
  })

  it('acercar el mapa no mueve el marcador', async () => {
    // Arrange
    const user = userEvent.setup()
    const { container, onMarkerMove } = setup()
    const zoomIn = container.querySelector<HTMLElement>('.leaflet-control-zoom-in')

    // Act
    if (zoomIn) await user.click(zoomIn)

    // Assert
    expect(zoomIn).not.toBeNull()
    expect(onMarkerMove).not.toHaveBeenCalled()
  })

  it('redimensionar la ventana no mueve el marcador', async () => {
    // Arrange
    const { container, onMarkerMove } = setup()

    // Act
    await resizeWindow(container, { width: 640, height: 320 })

    // Assert
    expect(onMarkerMove).not.toHaveBeenCalled()
  })

  it('muestra la atribución de OpenStreetMap, obligatoria al usar sus mapas', () => {
    // Arrange
    const expectedCredit = 'OpenStreetMap'

    // Act
    const { container } = setup()

    // Assert
    expect(container.querySelector('.leaflet-control-attribution')).toHaveTextContent(expectedCredit)
  })

  it('sin clave de Mapbox no muestra su logo', () => {
    // Arrange: mapa con los cuadros de OpenStreetMap

    // Act
    const { container } = setup()

    // Assert
    expect(container.querySelector('img[alt="Mapbox"]')).toBeNull()
  })

  it('con los cuadros de Mapbox muestra su atribución y su logo, que sus condiciones exigen', () => {
    // Arrange
    const container = document.body.appendChild(document.createElement('div'))

    // Act
    const map = createLeafletLocationMap(container, { markerLabel: MARKER_LABEL, tiles: chooseMapTiles('pk.publica.firma') })
    map.showPoint(TEGUCIGALPA)

    // Assert
    expect(container.querySelector('.leaflet-control-attribution')).toHaveTextContent('Mapbox')
    expect(container.querySelector('.leaflet-control-attribution')).toHaveTextContent('OpenStreetMap')
    expect(container.querySelector('img[alt="Mapbox"]')?.closest('a')).toHaveAttribute('href', 'https://www.mapbox.com/')
  })

  it('al destruirlo retira del contenedor todo lo que había pintado', () => {
    // Arrange
    const { container, map } = setup()

    // Act
    map.destroy()

    // Assert
    expect(container).toBeEmptyDOMElement()
  })

  it('destruirlo dos veces no falla: la segunda no tiene nada que retirar', () => {
    // Arrange
    const { container, map } = setup()
    map.destroy()

    // Act
    const destroyAgain = () => map.destroy()

    // Assert
    expect(destroyAgain).not.toThrow()
    expect(container).toBeEmptyDOMElement()
  })
})

describe('createLeafletLocationMap: mapa de solo consulta', () => {
  afterEach(() => {
    document.body.replaceChildren()
  })

  const setupReadOnly = () => {
    const container = document.body.appendChild(document.createElement('div'))
    const map = createLeafletLocationMap(container, { markerLabel: MARKER_LABEL })
    map.showPoint(TEGUCIGALPA)
    const marker = () => container.querySelector<HTMLElement>('.leaflet-marker-icon')

    return { container, map, marker }
  }

  it('muestra el marcador en el punto, pero no deja arrastrarlo', () => {
    // Arrange: ficha de una propiedad publicada

    // Act
    const { container, marker } = setupReadOnly()

    // Assert
    expect(marker()).toHaveAttribute('title', MARKER_LABEL)
    expect(container.querySelector('.leaflet-marker-draggable')).toBeNull()
  })

  it('un clic en el mapa no mueve el marcador', () => {
    // Arrange
    const { container, marker } = setupReadOnly()
    const positionBefore = marker()?.style.transform

    // Act
    fireEvent.click(container, { clientX: 120, clientY: 80 })

    // Assert
    expect(marker()?.style.transform).toBe(positionBefore)
  })

  it('ofrece los botones para acercar y alejar, para poder conocer la zona', () => {
    // Arrange: ficha de una propiedad publicada

    // Act
    const { container } = setupReadOnly()

    // Assert
    expect(container.querySelector('.leaflet-control-zoom-in')).toHaveAccessibleName('Acercar')
    expect(container.querySelector('.leaflet-control-zoom-out')).toHaveAccessibleName('Alejar')
  })

  it('el marcador no recibe el foco del teclado: no hay nada que hacer con él', () => {
    // Arrange: ficha de una propiedad publicada

    // Act
    const { marker } = setupReadOnly()

    // Assert
    expect(marker()).not.toHaveAttribute('tabindex')
  })

  it('al desplazar el mapa con las flechas el marcador se queda en la propiedad', () => {
    // Arrange
    const { container, marker } = setupReadOnly()
    const positionBefore = marker()?.style.transform
    container.focus()

    // Act
    fireEvent.keyDown(container, ARROW_RIGHT)
    fireEvent.keyUp(container, ARROW_RIGHT)

    // Assert
    expect(marker()?.style.transform).toBe(positionBefore)
  })
})

describe('chooseMapTiles', () => {
  it('con la clave pública de Mapbox usa sus cuadros, con la clave en la dirección', () => {
    // Arrange
    const token = 'pk.eyJ1IjoiZG9tdXMifQ.firma-123'

    // Act
    const tiles = chooseMapTiles(token)

    // Assert
    expect(tiles.url).toMatch(/^https:\/\/api\.mapbox\.com\/styles\/v1\/mapbox\/streets-v12\/tiles\/512\//)
    expect(tiles.url).toContain(`access_token=${token}`)
    expect(tiles).toMatchObject({ tileSize: 512, zoomOffset: -1, showMapboxLogo: true })
  })

  it.each([
    ['sin clave', undefined],
    ['con una clave vacía', '  '],
    ['con la clave secreta, que nunca debe viajar en el sitio', 'sk.eyJ1IjoiZG9tdXMifQ.firma'],
    ['con algo que no es una clave', 'cualquier-cosa'],
  ])('%s usa OpenStreetMap', (_case, token) => {
    // Arrange: la clave del caso

    // Act
    const tiles = chooseMapTiles(token)

    // Assert
    expect(tiles.url).toBe('https://tile.openstreetmap.org/{z}/{x}/{y}.png')
    expect(tiles.showMapboxLogo).toBe(false)
  })
})
