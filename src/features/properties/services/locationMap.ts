import { Browser, control, divIcon, map as createMap, marker as createMarker, tileLayer } from 'leaflet'
import type { LatLngExpression, Marker } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Coordinates, MapView } from '@/features/properties/types/publication.types'

export interface LocationMap {
  /** Centra el mapa en un punto y coloca ahí el marcador; no cuenta como un movimiento de la persona. */
  showPoint(view: MapView): void
  destroy(): void
}

interface LocationMapOptions {
  /** Describe el marcador a quien no lo ve. */
  markerLabel: string
  /**
   * Recibe el punto cada vez que la persona mueve el marcador. Sin él, el mapa es de solo consulta: se puede
   * recorrer y acercar para conocer la zona, pero el marcador queda fijo en el punto mostrado.
   */
  onMarkerMove?: (point: Coordinates) => void
}

export type CreateLocationMap = (container: HTMLElement, options: LocationMapOptions) => LocationMap

const TILES_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
const TILES_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
const MAX_ZOOM = 19
const ARROW_KEYS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']

const MARKER_SIZE = 36
/** En el dibujo, de 24 unidades de alto, la punta de la chincheta está en la 22. */
const MARKER_TIP = (MARKER_SIZE * 22) / 24

// Chincheta dibujada aquí mismo: el icono por defecto de Leaflet depende de imágenes que el empaquetador no encuentra.
const MARKER_ICON = divIcon({
  className: 'text-primary drop-shadow-md',
  html: `<svg xmlns="http://www.w3.org/2000/svg" width="${MARKER_SIZE}" height="${MARKER_SIZE}" viewBox="0 0 24 24" fill="currentColor" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3" fill="white"/></svg>`,
  iconSize: [MARKER_SIZE, MARKER_SIZE],
  iconAnchor: [MARKER_SIZE / 2, MARKER_TIP],
})

/** Mapa de OpenStreetMap con Leaflet. Es el único archivo que conoce la librería del mapa. */
export const createLeafletLocationMap: CreateLocationMap = (container, { markerLabel, onMarkerMove }) => {
  const canMoveMarker = onMarkerMove !== undefined

  const leafletMap = createMap(container, {
    // Sin zoom con la rueda: secuestraría el desplazamiento de la página o de la ventana que contiene el mapa.
    scrollWheelZoom: false,
    // En una ficha, arrastrar el mapa con el dedo atraparía el desplazamiento de la página: en móviles se
    // recorre con los botones de zoom y el gesto de pellizco.
    dragging: canMoveMarker || !Browser.mobile,
    zoomControl: false,
  })
  // Los botones de zoom se añaden aparte para darles nombre en español: Leaflet los trae en inglés.
  control.zoom({ zoomInTitle: 'Acercar', zoomOutTitle: 'Alejar' }).addTo(leafletMap)
  tileLayer(TILES_URL, { attribution: TILES_ATTRIBUTION, maxZoom: MAX_ZOOM }).addTo(leafletMap)

  let pin: Marker | undefined
  let isPannedByKeyboard = false
  let isDestroyed = false

  const reportMove = () => {
    if (!pin || !onMarkerMove) return

    const { lat, lng } = pin.getLatLng()
    onMarkerMove({ lat, lng })
  }

  const placeMarker = (point: LatLngExpression) => {
    if (pin) {
      pin.setLatLng(point)
      return
    }

    pin = createMarker(point, {
      icon: MARKER_ICON,
      title: markerLabel,
      draggable: canMoveMarker,
      autoPan: true,
      // Un marcador fijo no hace nada: no recibe el foco del teclado ni los clics.
      keyboard: canMoveMarker,
      interactive: canMoveMarker,
      bubblingMouseEvents: false,
    }).addTo(leafletMap)
    if (canMoveMarker) pin.on('dragend', reportMove)
  }

  // Con el teclado el marcador no se puede arrastrar: al desplazar el mapa con las flechas, lo acompaña en el centro.
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.target === container && ARROW_KEYS.includes(event.key)) isPannedByKeyboard = true
  }
  // Desplazar el mapa con el ratón o el dedo, en cambio, deja el marcador donde estaba.
  const handlePointerDown = () => {
    isPannedByKeyboard = false
  }

  if (canMoveMarker) {
    // Un clic (o un toque) en el mapa lleva el marcador a ese punto.
    leafletMap.on('click', ({ latlng }) => {
      placeMarker(latlng)
      reportMove()
    })
    container.addEventListener('keydown', handleKeyDown)
    container.addEventListener('pointerdown', handlePointerDown)

    leafletMap.on('moveend', () => {
      if (!isPannedByKeyboard) return

      isPannedByKeyboard = false
      placeMarker(leafletMap.getCenter())
      reportMove()
    })
  }

  return {
    showPoint: ({ center, zoom }) => {
      const point: LatLngExpression = [center.lat, center.lng]
      leafletMap.setView(point, zoom, { animate: false })
      placeMarker(point)
    },
    destroy: () => {
      // Repetirlo no hace nada: Leaflet falla si se le pide retirar dos veces el mismo mapa.
      if (isDestroyed) return
      isDestroyed = true

      if (canMoveMarker) {
        container.removeEventListener('keydown', handleKeyDown)
        container.removeEventListener('pointerdown', handlePointerDown)
      }
      leafletMap.remove()
    },
  }
}
