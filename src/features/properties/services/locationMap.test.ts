import { fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createLeafletLocationMap } from '@/features/properties/services/locationMap'

const TEGUCIGALPA = { center: { lat: 14.0723, lng: -87.1921 }, zoom: 13 }
const SAN_PEDRO_SULA = { center: { lat: 15.5042, lng: -88.025 }, zoom: 13 }
/** Leaflet 1.9 lee el `keyCode` heredado, que `user-event` no rellena: la tecla se envía con él. */
const ARROW_RIGHT_KEY_CODE = 39

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
  const onMove = vi.fn()
  const map = createLeafletLocationMap(container, { onMove })
  map.setView(TEGUCIGALPA)

  return { container, onMove, map }
}

describe('createLeafletLocationMap', () => {
  afterEach(() => {
    document.body.replaceChildren()
  })

  it('situar el mapa por código no cuenta como un movimiento de la persona', () => {
    // Arrange
    const { map, onMove } = setup()

    // Act
    map.setView(SAN_PEDRO_SULA)

    // Assert
    expect(onMove).not.toHaveBeenCalled()
  })

  it('cuando la persona desplaza el mapa con el teclado avisa del nuevo punto central', () => {
    // Arrange
    const { container, onMove } = setup()
    container.focus()

    // Act
    fireEvent.keyDown(container, { keyCode: ARROW_RIGHT_KEY_CODE })

    // Assert
    expect(onMove).toHaveBeenCalledOnce()
    const [point] = onMove.mock.calls[0]
    expect(point.lat).toBeCloseTo(TEGUCIGALPA.center.lat, 3)
    expect(point.lng).toBeGreaterThan(TEGUCIGALPA.center.lng)
  })

  it('acercar el mapa sin desplazarlo no marca ningún punto', async () => {
    // Arrange
    const user = userEvent.setup()
    const { container, onMove } = setup()
    const zoomIn = container.querySelector<HTMLElement>('.leaflet-control-zoom-in')

    // Act
    if (zoomIn) await user.click(zoomIn)

    // Assert
    expect(zoomIn).not.toBeNull()
    expect(onMove).not.toHaveBeenCalled()
  })

  it('redimensionar la ventana recoloca el mapa, pero no marca ningún punto', async () => {
    // Arrange
    const { container, onMove } = setup()

    // Act
    await resizeWindow(container, { width: 640, height: 320 })

    // Assert
    expect(onMove).not.toHaveBeenCalled()
  })

  it('después de redimensionar, lo que desplaza la persona sigue contando', async () => {
    // Arrange
    const { container, onMove } = setup()
    await resizeWindow(container, { width: 640, height: 320 })
    container.focus()

    // Act
    fireEvent.keyDown(container, { keyCode: ARROW_RIGHT_KEY_CODE })

    // Assert
    await waitFor(() => expect(onMove).toHaveBeenCalledOnce())
  })

  it('muestra la atribución de OpenStreetMap, obligatoria al usar sus mapas', () => {
    // Arrange
    const expectedCredit = 'OpenStreetMap'

    // Act
    const { container } = setup()

    // Assert
    expect(container.querySelector('.leaflet-control-attribution')).toHaveTextContent(expectedCredit)
  })

  it('al destruirlo retira del contenedor todo lo que había pintado', () => {
    // Arrange
    const { container, map } = setup()

    // Act
    map.destroy()

    // Assert
    expect(container).toBeEmptyDOMElement()
  })
})
