import { MapPin } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import type { BreadcrumbItem } from '@/components/Breadcrumb'
import PropertyContactCard from '@/features/properties/components/PropertyContactCard'
import PropertyDetailLayout from '@/features/properties/components/PropertyDetailLayout'
import PropertyDetailSection from '@/features/properties/components/PropertyDetailSection'
import PropertyGallery from '@/features/properties/components/PropertyGallery'
import PropertyHighlights from '@/features/properties/components/PropertyHighlights'
import PropertyLocationSection from '@/features/properties/components/PropertyLocationSection'
import PropertyPrice from '@/features/properties/components/PropertyPrice'
import PropertyToolbar from '@/features/properties/components/PropertyToolbar'
import { PROPERTY_TYPES } from '@/features/properties/data/propertyOptions.data'
import type { Property } from '@/features/properties/types/property.types'
import { ROUTES, propertyTypePath } from '@/shared/constants/routes'
import { toParagraphs } from '@/shared/utils/text'

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
  const { title, description, district, city, gallery, location } = property

  return (
    <PropertyDetailLayout
      breadcrumb={<Breadcrumb items={buildBreadcrumb(property)} />}
      actions={<PropertyToolbar property={property} />}
      header={
        <header className="grid gap-3">
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-balance md:text-4xl">{title}</h1>
          <p className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="size-4 shrink-0" aria-hidden="true" />
            {district}, {city}
          </p>
          <PropertyPrice property={property} prefix="Desde" className="text-3xl" />
        </header>
      }
      gallery={<PropertyGallery images={gallery} title={title} />}
      sidebar={<PropertyContactCard property={property} />}
      // Al final, a lo ancho de las dos columnas. El catálogo de ejemplo no trae el punto, y entonces no hay sección.
      wide={location && <PropertyLocationSection location={location} district={district} city={city} />}
    >
      {/* Justo debajo de las fotos: lo esencial de la propiedad antes del texto. */}
      <PropertyHighlights property={property} />

      <PropertyDetailSection id="descripcion" title="Descripción">
        {/*
          El navegador junta los saltos de línea de un texto, así que se pinta como se escribió: un párrafo
          por cada uno, y `whitespace-pre-line` para los saltos que haya dentro de ellos.
        */}
        <div className="grid gap-4 leading-relaxed text-pretty text-muted-foreground">
          {toParagraphs(description).map((paragraph, position) => (
            <p key={position} className="whitespace-pre-line">
              {paragraph}
            </p>
          ))}
        </div>
      </PropertyDetailSection>
    </PropertyDetailLayout>
  )
}

export default PropertyDetail
