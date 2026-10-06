import { MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import PropertyPhoto from '@/features/properties/components/PropertyPhoto'
import PropertyPrice from '@/features/properties/components/PropertyPrice'
import PropertyStats from '@/features/properties/components/PropertyStats'
import { OPERATIONS, PROPERTY_TYPES } from '@/features/properties/data/propertyOptions.data'
import type { Property } from '@/features/properties/types/property.types'
import { propertyDetailPath } from '@/shared/constants/routes'

interface PropertyCardProps {
  property: Property
}

const PropertyCard = ({ property }: PropertyCardProps) => {
  const { id, title, type, operation, district, city, image } = property

  return (
    <Card className="relative h-full gap-0 py-0 transition-shadow duration-300 focus-within:shadow-lg hover:shadow-lg">
      <div className="relative aspect-4/3 overflow-hidden bg-muted">
        <PropertyPhoto
          source={image}
          alt=""
          loading="lazy"
          className="size-full object-cover transition-transform duration-500 group-hover/card:scale-105"
        />
        <div className="absolute top-3 left-3 flex gap-1.5">
          <Badge>{OPERATIONS[operation].label}</Badge>
          <Badge variant="secondary">{PROPERTY_TYPES[type].label}</Badge>
        </div>
      </div>

      <CardContent className="flex flex-1 flex-col gap-2 p-4">
        <PropertyPrice property={property} />
        <h3 className="text-base leading-snug font-medium">
          {/* El enlace cubre toda la tarjeta para que sea clicable con un único enlace. */}
          <Link
            to={propertyDetailPath(id)}
            className="outline-none after:absolute after:inset-0 after:rounded-xl focus-visible:after:ring-3 focus-visible:after:ring-ring/50"
          >
            {title}
          </Link>
        </h3>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="size-4 shrink-0" aria-hidden="true" />
          {district}, {city}
        </p>
        <PropertyStats property={property} className="mt-auto border-t pt-3" />
      </CardContent>
    </Card>
  )
}

export default PropertyCard
