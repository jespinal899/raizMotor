import { lazy, Suspense } from 'react'
import { EyeOff, MapPin, Navigation } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import type { BreadcrumbItem } from '@/components/Breadcrumb'
import ExternalButtonLink from '@/components/ExternalButtonLink'
import StatusAlert from '@/components/StatusAlert'
import { Badge } from '@/components/ui/badge'
import PropertyContactCard from '@/features/properties/components/PropertyContactCard'
import PropertyDetailLayout from '@/features/properties/components/PropertyDetailLayout'
import PropertyDetailSection from '@/features/properties/components/PropertyDetailSection'
import PropertyGallery from '@/features/properties/components/PropertyGallery'
import PropertyHighlights from '@/features/properties/components/PropertyHighlights'
import PropertyPrice from '@/features/properties/components/PropertyPrice'
import PropertyToolbar from '@/features/properties/components/PropertyToolbar'
import { OPERATIONS, PROPERTY_TYPES } from '@/features/properties/data/propertyOptions.data'
import type { Property } from '@/features/properties/types/property.types'
import { buildDirectionsUrl } from '@/features/properties/utils/propertyDirections'
import { ROUTES, propertyTypePath } from '@/shared/constants/routes'

const LOCAL_ONLY_NOTE = {
  title: 'Este anuncio solo está guardado en este navegador',
  description:
    'Otras personas todavía no pueden verlo, y el enlace no funcionará en otro dispositivo. ' +
    'Si borras los datos del navegador, se pierde.',
}
const LocationMapView = lazy(() => import('@/features/properties/components/LocationMapView'))

const buildBreadcrumb = ({ title, type }: Property): BreadcrumbItem[] => {
  const { plural, slug } = PROPERTY_TYPES[type]

  return [
    { label: 'Inicio', to: ROUTES.home },
    { label: 'Propiedades', to: ROUTES.properties },
    { label: plural, to: propertyTypePath(slug) },
    { label: title },
  ]
}

interface PropertyDetailProps {
  property: Property
}

const PropertyDetail = ({ property }: PropertyDetailProps) => {
  const { title, description, type, operation, district, city, gallery, location, localOnly } = property

  return (
    <PropertyDetailLayout
      breadcrumb={<Breadcrumb items={buildBreadcrumb(property)} />}
      actions={<PropertyToolbar property={property} />}
      header={
        <header className="grid gap-3">
          <div className="flex gap-1.5">
            <Badge>{OPERATIONS[operation].label}</Badge>
            <Badge variant="secondary">{PROPERTY_TYPES[type].label}</Badge>
          </div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-balance md:text-4xl">{title}</h1>
          <p className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="size-4 shrink-0" aria-hidden="true" />
            {district}, {city}
          </p>
          <PropertyPrice property={property} prefix="Desde" className="text-3xl" />
          {/* Arriba del todo: es lo primero que debe saber quien acaba de publicar y piensa compartir el enlace. */}
          {localOnly && <StatusAlert role="note" icon={EyeOff} {...LOCAL_ONLY_NOTE} />}
        </header>
      }
      gallery={<PropertyGallery images={gallery} title={title} />}
      sidebar={<PropertyContactCard property={property} />}
    >
      {/* Justo debajo de las fotos: lo esencial de la propiedad antes del texto. */}
      <PropertyHighlights property={property} />

      <PropertyDetailSection id="descripcion" title="Descripción">
        <p className="leading-relaxed text-pretty text-muted-foreground">{description}</p>
      </PropertyDetailSection>

      {location && (
        <PropertyDetailSection id="ubicacion-propiedad" title="Ubicación">
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
            <address className="grid gap-1 text-sm text-muted-foreground not-italic">
              <span>{location.address}</span>
              <span>
                {district}, {city}
              </span>
              <span>{location.department}</span>
            </address>
            <ExternalButtonLink
              href={buildDirectionsUrl(location.coordinates)}
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
                className="h-72 animate-pulse rounded-lg border bg-muted sm:h-80"
              />
            }
          >
            <LocationMapView view={{ center: location.coordinates, zoom: 15 }} label="Mapa de la propiedad" />
          </Suspense>
        </PropertyDetailSection>
      )}
    </PropertyDetailLayout>
  )
}

export default PropertyDetail
