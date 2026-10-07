import { lazy, Suspense } from 'react'
import { Navigation } from 'lucide-react'
import ExternalButtonLink from '@/components/ExternalButtonLink'
import PropertyDetailSection from '@/features/properties/components/PropertyDetailSection'
import type { PropertyLocation } from '@/features/properties/types/property.types'
import { buildDirectionsUrl } from '@/features/properties/utils/propertyDirections'
import { cn } from '@/lib/utils'

// El mapa pesa: se descarga aparte, solo en las fichas que tienen su punto.
const LocationMapView = lazy(() => import('@/features/properties/components/LocationMapView'))

/** El bloque ocupa las dos columnas de la ficha: en escritorio el mapa gana alto para no quedar como una franja. */
const MAP_HEIGHT = 'lg:h-112'

interface PropertyLocationSectionProps {
  location: PropertyLocation
  district: string
  city: string
}

/**
 * Dónde está la propiedad: su dirección con el enlace para llegar, en una fila, y debajo el mapa. Quien la
 * coloca decide su ancho; el mapa lo ocupa entero.
 */
const PropertyLocationSection = ({ location, district, city }: PropertyLocationSectionProps) => {
  const { address, department, coordinates } = location

  return (
    <PropertyDetailSection id="ubicacion-propiedad" title="Ubicación">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <address className="grid gap-1 text-sm text-muted-foreground not-italic">
          <span>{address}</span>
          <span>
            {district}, {city}
          </span>
          <span>{department}</span>
        </address>
        <ExternalButtonLink
          href={buildDirectionsUrl(coordinates)}
          variant="outline"
          size="lg"
          className="h-11 text-base"
        >
          <Navigation />
          Cómo llegar
        </ExternalButtonLink>
      </div>

      <Suspense
        fallback={
          <div
            role="img"
            aria-label="Cargando mapa de la propiedad"
            className={cn('h-72 animate-pulse rounded-lg border bg-muted sm:h-80', MAP_HEIGHT)}
          />
        }
      >
        <LocationMapView view={{ center: coordinates, zoom: 15 }} label="Mapa de la propiedad" className={MAP_HEIGHT} />
      </Suspense>
    </PropertyDetailSection>
  )
}

export default PropertyLocationSection
