import { Check } from 'lucide-react'
import PropertyDetailSection from '@/features/properties/components/PropertyDetailSection'
import { PROPERTY_FACT_ICONS } from '@/features/properties/data/propertyOptions.data'
import type { Property } from '@/features/properties/types/property.types'
import { getPropertyHighlights } from '@/features/properties/utils/propertyHighlights'

interface PropertyHighlightsProps {
  property: Property
}

/** Lo esencial de la propiedad de un vistazo: dormitorios, baños, superficies y sus comodidades. */
const PropertyHighlights = ({ property }: PropertyHighlightsProps) => {
  const { features } = property

  return (
    <PropertyDetailSection id="caracteristicas-destacadas" title="Características destacadas">
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {getPropertyHighlights(property).map(({ key, label, value }) => {
          const Icon = PROPERTY_FACT_ICONS[key]

          return (
            <div key={key} className="grid content-start gap-1 rounded-xl border bg-card p-4">
              <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon className="size-4 shrink-0 text-primary" aria-hidden="true" />
                {label}
              </dt>
              <dd className="font-heading text-lg font-semibold">{value}</dd>
            </div>
          )
        })}
      </dl>

      {features.length > 0 && (
        <ul className="grid gap-2.5 pt-1 sm:grid-cols-2">
          {features.map((feature) => (
            <li key={feature} className="flex items-center gap-2">
              <Check className="size-4 shrink-0 text-primary" aria-hidden="true" />
              {feature}
            </li>
          ))}
        </ul>
      )}
    </PropertyDetailSection>
  )
}

export default PropertyHighlights
