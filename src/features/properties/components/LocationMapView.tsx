import { useEffect, useEffectEvent, useRef } from 'react'
import { createLeafletLocationMap } from '@/features/properties/services/locationMap'
import type { CreateLocationMap, LocationMap } from '@/features/properties/services/locationMap'
import type { Coordinates, MapView } from '@/features/properties/types/publication.types'

interface LocationMapViewProps {
  /** Punto que se muestra, con el marcador encima. Al cambiar, el mapa se desplaza hasta él. */
  view: MapView
  /** Nombre del mapa para quien no lo ve. */
  label: string
  onMarkerMove?: (point: Coordinates) => void
  /** En una ficha el mapa solo muestra el punto publicado. */
  interactive?: boolean
  createMap?: CreateLocationMap
}

const MARKER_LABEL = 'Ubicación de la propiedad'

/** Mapa con un marcador que la persona puede arrastrar, o colocar con un clic, hasta el punto exacto. */
const LocationMapView = ({
  view,
  label,
  onMarkerMove = () => {},
  interactive = true,
  createMap = createLeafletLocationMap,
}: LocationMapViewProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<LocationMap | null>(null)
  const reportMove = useEffectEvent(onMarkerMove)
  const { lat, lng } = view.center
  const { zoom } = view

  useEffect(() => {
    if (!containerRef.current) return

    const map = createMap(containerRef.current, {
      markerLabel: MARKER_LABEL,
      onMarkerMove: (point) => reportMove(point),
      interactive,
    })
    mapRef.current = map

    return () => {
      map.destroy()
      mapRef.current = null
    }
  }, [createMap, interactive])

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
