import { Check, MapPin } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import type { BreadcrumbItem } from '@/components/Breadcrumb'
import { Badge } from '@/components/ui/badge'
import PropertyContactCard from '@/features/properties/components/PropertyContactCard'
import PropertyGallery from '@/features/properties/components/PropertyGallery'
import { OPERATIONS, PROPERTY_TYPES } from '@/features/properties/data/propertyOptions.data'
import type { Property } from '@/features/properties/types/property.types'
import { ROUTES, propertyTypePath } from '@/shared/constants/routes'

const sectionTitle = 'font-heading text-xl font-semibold tracking-tight'

interface PropertyDetailProps {
  property: Property
}

const PropertyDetail = ({ property }: PropertyDetailProps) => {
  const { title, description, type, operation, district, city, features, gallery } = property
  const { label: typeLabel, plural: typePlural, slug: typeSlug } = PROPERTY_TYPES[type]

  const breadcrumb: BreadcrumbItem[] = [
    { label: 'Inicio', to: ROUTES.home },
    { label: 'Propiedades', to: ROUTES.properties },
    { label: typePlural, to: propertyTypePath(typeSlug) },
    { label: title },
  ]

  return (
    <article className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb items={breadcrumb} />

      <header className="grid gap-3">
        <div className="flex gap-1.5">
          <Badge>{OPERATIONS[operation].label}</Badge>
          <Badge variant="secondary">{typeLabel}</Badge>
        </div>
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-balance md:text-4xl">{title}</h1>
        <p className="flex items-center gap-1.5 text-muted-foreground">
          <MapPin className="size-4 shrink-0" aria-hidden="true" />
          {district}, {city}
        </p>
      </header>

      {/* En móvil el precio y el contacto van justo después de las fotos; en escritorio, en una columna fija. */}
      <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <PropertyGallery images={gallery} title={title} />

        <aside className="lg:sticky lg:top-24 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start">
          <PropertyContactCard property={property} />
        </aside>

        <div className="grid gap-8 lg:col-start-1">
          <section aria-labelledby="descripcion" className="grid gap-3">
            <h2 id="descripcion" className={sectionTitle}>
              Descripción
            </h2>
            <p className="leading-relaxed text-pretty text-muted-foreground">{description}</p>
          </section>

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
        </div>
      </div>
    </article>
  )
}

export default PropertyDetail
