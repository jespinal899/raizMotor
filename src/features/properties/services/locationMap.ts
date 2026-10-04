import { map as createMap, tileLayer } from 'leaflet'
import type { LatLng } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Coordinates, MapView } from '@/features/properties/types/publication.types'

export interface LocationMap {
  /** Sitúa el mapa por código; no cuenta como un movimiento de la persona. */
  setView(view: MapView): void
  destroy(): void
}

interface LocationMapOptions {
  /** Recibe el centro del mapa cada vez que la persona lo desplaza. */
  onMove: (center: Coordinates) => void
}

export type CreateLocationMap = (container: HTMLElement, options: LocationMapOptions) => LocationMap

const TILES_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
const TILES_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
const MAX_ZOOM = 19

/** Mapa de OpenStreetMap con Leaflet. Es el único archivo que conoce la librería del mapa. */
export const createLeafletLocationMap: CreateLocationMap = (container, { onMove }) => {
  // Sin zoom con la rueda: el mapa está dentro de un formulario largo y secuestraría el desplazamiento de la página.
  const leafletMap = createMap(container, { scrollWheelZoom: false })
  tileLayer(TILES_URL, { attribution: TILES_ATTRIBUTION, maxZoom: MAX_ZOOM }).addTo(leafletMap)

  let lastCenter: LatLng | undefined
  let isMovingByCode = false
  let isResizing = false

  // Al cambiar el tamaño de la ventana (o girar el móvil), Leaflet recoloca el mapa y lo avisa como un movimiento más.
  leafletMap.on('resize', () => {
    isResizing = true
  })

  leafletMap.on('moveend', () => {
    const center = leafletMap.getCenter()
    const isSamePoint = lastCenter?.equals(center) ?? false
    const wasResizing = isResizing
    lastCenter = center
    isResizing = false

    // Solo cuenta lo que desplaza la persona: situar el mapa por código, redimensionarlo o acercarlo no marca ningún punto.
    if (isMovingByCode || wasResizing || isSamePoint) return

    onMove({ lat: center.lat, lng: center.lng })
  })

  return {
    setView: ({ center, zoom }) => {
      isMovingByCode = true
      leafletMap.setView([center.lat, center.lng], zoom, { animate: false })
      isMovingByCode = false
    },
    destroy: () => {
      leafletMap.remove()
    },
  }
}
