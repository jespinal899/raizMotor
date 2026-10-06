import { lazy, Suspense } from 'react'
import { Check, EyeOff, MapPin } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import type { BreadcrumbItem } from '@/components/Breadcrumb'
import StatusAlert from '@/components/StatusAlert'
import { Badge } from '@/components/ui/badge'
import PropertyContactCard from '@/features/properties/components/PropertyContactCard'
import PropertyDetailLayout from '@/features/properties/components/PropertyDetailLayout'
import PropertyGallery from '@/features/properties/components/PropertyGallery'
import { OPERATIONS, PROPERTY_TYPES } from '@/features/properties/data/propertyOptions.data'
import type { Property } from '@/features/properties/types/property.types'
import { ROUTES, propertyTypePath } from '@/shared/constants/routes'
import { formatArea } from '@/shared/utils/format'

const sectionTitle = 'font-heading text-xl font-semibold tracking-tight'

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
  const { title, description, type, operation, district, city, features, gallery } = property
  const { location, builtArea, landArea, localOnly } = property

  return (
    <PropertyDetailLayout
      breadcrumb={<Breadcrumb items={buildBreadcrumb(property)} />}
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
          {/* Arriba del todo: es lo primero que debe saber quien acaba de publicar y piensa compartir el enlace. */}
          {localOnly && <StatusAlert role="note" icon={EyeOff} {...LOCAL_ONLY_NOTE} />}
        </header>
      }
      gallery={<PropertyGallery images={gallery} title={title} />}
      sidebar={<PropertyContactCard property={property} />}
    >
      <section aria-labelledby="descripcion" className="grid gap-3">
        <h2 id="descripcion" className={sectionTitle}>
          Descripción
        </h2>
        <p className="leading-relaxed text-pretty text-muted-foreground">{description}</p>
      </section>

      {features.length > 0 && (
        <section aria-labelledby="caracteristicas" className="grid gap-3">
          <h2 id="caracteristicas" className={sectionTitle}>
            Características
          </h2>
          <ul className="grid gap-2.5 sm:grid-cols-2">
            {features.map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <Check className="size-4 shrink-0 text-primary" aria-hidden="true" />
                {feature}
              </li>
            ))}
          </ul>
        </section>
      )}

      {(builtArea !== undefined || landArea !== undefined) && (
        <section aria-labelledby="superficies" className="grid gap-3">
          <h2 id="superficies" className={sectionTitle}>
            Superficies
          </h2>
          <dl className="grid gap-2 sm:grid-cols-2">
            {builtArea !== undefined && (
              <div>
                <dt className="text-sm text-muted-foreground">Superficie construida</dt>
                <dd className="font-medium">{formatArea(builtArea)}</dd>
              </div>
            )}
            {landArea !== undefined && (
              <div>
                <dt className="text-sm text-muted-foreground">Superficie del terreno</dt>
                <dd className="font-medium">{formatArea(landArea)}</dd>
              </div>
            )}
          </dl>
        </section>
      )}

      {location && (
        <section aria-labelledby="ubicacion-propiedad" className="grid gap-3">
          <h2 id="ubicacion-propiedad" className={sectionTitle}>
            Ubicación
          </h2>
          <address className="grid gap-1 text-sm not-italic text-muted-foreground">
            <span>{location.address}</span>
            <span>{district}, {city}</span>
            <span>{location.department}</span>
          </address>
          <Suspense
            fallback={
              <div
                role="img"
                aria-label="Cargando mapa de la propiedad"
                className="h-72 animate-pulse rounded-lg border bg-muted sm:h-80"
              />
            }
          >
            <LocationMapView
              view={{ center: location.coordinates, zoom: 15 }}
              label="Mapa de la propiedad"
            />
          </Suspense>
        </section>
      )}
    </PropertyDetailLayout>
  )
}

export default PropertyDetail
