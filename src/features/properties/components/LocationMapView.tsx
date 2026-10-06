import { useEffect, useEffectEvent, useRef } from 'react'
import { createLeafletLocationMap } from '@/features/properties/services/locationMap'
import type { CreateLocationMap, LocationMap } from '@/features/properties/services/locationMap'
import type { Coordinates, MapView } from '@/features/properties/types/publication.types'

interface LocationMapViewProps {
  /** Punto que se muestra, con el marcador encima. Al cambiar, el mapa se desplaza hasta él. */
  view: MapView
  /** Nombre del mapa para quien no lo ve. */
  label: string
  /**
   * Recibe el punto cuando la persona mueve el marcador. Sin él, el mapa es de solo consulta: muestra el
   * punto con el marcador fijo, como en la ficha de una propiedad.
   */
  onMarkerMove?: (point: Coordinates) => void
  createMap?: CreateLocationMap
}

const MARKER_LABEL = 'Ubicación de la propiedad'

/** Mapa con un marcador en un punto. Para elegirlo, la persona lo arrastra o lo coloca con un clic. */
const LocationMapView = ({ view, label, onMarkerMove, createMap = createLeafletLocationMap }: LocationMapViewProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<LocationMap | null>(null)
  const reportMove = useEffectEvent((point: Coordinates) => onMarkerMove?.(point))
  const canMoveMarker = onMarkerMove !== undefined
  const { lat, lng } = view.center
  const { zoom } = view

  useEffect(() => {
    if (!containerRef.current) return

    const map = createMap(containerRef.current, {
      markerLabel: MARKER_LABEL,
      onMarkerMove: canMoveMarker ? (point) => reportMove(point) : undefined,
    })
    mapRef.current = map

    return () => {
      map.destroy()
      mapRef.current = null
    }
  }, [createMap, canMoveMarker])

  // Depende de los valores y no del objeto: un punto igual no debe deshacer lo que movió la persona.
  useEffect(() => {
    mapRef.current?.showPoint({ center: { lat, lng }, zoom })
  }, [lat, lng, zoom])

  return (
    <div className="relative isolate h-72 overflow-hidden rounded-lg border has-focus-visible:ring-3 has-focus-visible:ring-ring/50 sm:h-80">
      <div ref={containerRef} role="application" aria-label={label} tabIndex={0} className="size-full outline-none" />
    </div>
  )
}

export default LocationMapView
