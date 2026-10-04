import { useEffect, useEffectEvent, useRef } from 'react'
import { MapPin } from 'lucide-react'
import FormGroup from '@/components/FormGroup'
import { createLeafletLocationMap } from '@/features/properties/services/locationMap'
import type { CreateLocationMap, LocationMap } from '@/features/properties/services/locationMap'
import type { Coordinates, MapView } from '@/features/properties/types/publication.types'

interface LocationPickerProps {
  /** Zona que muestra el mapa. Al cambiar (p. ej. al elegir departamento), el mapa se desplaza hasta ella. */
  view: MapView
  /** Punto marcado, o `null` si aún no se ha colocado. */
  value: Coordinates | null
  onChange: (point: Coordinates) => void
  error?: string
  createMap?: CreateLocationMap
}

const COORDINATE_DECIMALS = 5

const formatCoordinates = ({ lat, lng }: Coordinates) =>
  `${lat.toFixed(COORDINATE_DECIMALS)}, ${lng.toFixed(COORDINATE_DECIMALS)}`

/** Mapa con un marcador fijo en el centro: el punto se elige desplazando el mapa bajo él. */
const LocationPicker = ({ view, value, onChange, error, createMap = createLeafletLocationMap }: LocationPickerProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<LocationMap | null>(null)
  const reportMove = useEffectEvent(onChange)
  const { lat, lng } = view.center
  const { zoom } = view

  useEffect(() => {
    if (!containerRef.current) return

    const map = createMap(containerRef.current, { onMove: (center) => reportMove(center) })
    mapRef.current = map

    return () => {
      map.destroy()
      mapRef.current = null
    }
  }, [createMap])

  // Depende de los valores y no del objeto: una vista igual no debe deshacer lo que movió la persona.
  useEffect(() => {
    mapRef.current?.setView({ center: { lat, lng }, zoom })
  }, [lat, lng, zoom])

  return (
    <FormGroup label="Punto exacto en el mapa" error={error}>
      {(group) => (
        <div className="grid gap-2">
          <div className="relative isolate h-72 overflow-hidden rounded-lg border has-focus-visible:ring-3 has-focus-visible:ring-ring/50 has-aria-invalid:border-destructive sm:h-80">
            <div ref={containerRef} role="application" tabIndex={0} {...group} className="size-full outline-none" />
            <MapPin
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-1/2 z-1000 size-9 -translate-x-1/2 -translate-y-[92%] fill-primary text-primary-foreground drop-shadow-md"
            />
          </div>
          <p aria-live="polite" className="text-sm text-muted-foreground">
            {value
              ? `Punto marcado: ${formatCoordinates(value)}`
              : 'Arrastra el mapa hasta que el marcador quede sobre la propiedad.'}
          </p>
        </div>
      )}
    </FormGroup>
  )
}

export default LocationPicker
