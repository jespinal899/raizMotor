import { Bath, BedDouble, MapPin, Scaling } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { OPERATIONS, PROPERTY_TYPES } from '@/features/properties/data/propertyOptions.data'
import type { Property } from '@/features/properties/types/property.types'
import { propertyDetailPath } from '@/shared/constants/routes'
import { formatArea, formatPrice } from '@/shared/utils/format'

interface PropertyCardProps {
  property: Property
}

const PropertyCard = ({ property }: PropertyCardProps) => {
  const { id, title, type, operation, price, district, city, area, bedrooms, bathrooms, image } = property

  return (
    <Card className="relative h-full gap-0 py-0 transition-shadow duration-300 focus-within:shadow-lg hover:shadow-lg">
      <div className="relative aspect-4/3 overflow-hidden bg-muted">
        <img
          src={image}
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
        <p className="font-heading text-xl font-semibold tracking-tight text-primary">
          {formatPrice(price)}
          {operation === 'alquiler' && (
            <span className="text-sm font-normal text-muted-foreground"> / mes</span>
          )}
        </p>
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

        <ul className="mt-auto flex flex-wrap gap-x-4 gap-y-1 border-t pt-3 text-sm text-muted-foreground">
          {bedrooms !== undefined && (
            <li className="flex items-center gap-1.5">
              <BedDouble className="size-4" aria-hidden="true" />
              {bedrooms} dorm.
            </li>
          )}
          {bathrooms !== undefined && (
            <li className="flex items-center gap-1.5">
              <Bath className="size-4" aria-hidden="true" />
              {bathrooms} {bathrooms === 1 ? 'baño' : 'baños'}
            </li>
          )}
          <li className="flex items-center gap-1.5">
            <Scaling className="size-4" aria-hidden="true" />
            {formatArea(area)}
          </li>
        </ul>
      </CardContent>
    </Card>
  )
}

export default PropertyCard
