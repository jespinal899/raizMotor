import { MessageCircle } from 'lucide-react'
import ButtonLink from '@/components/ButtonLink'
import { Card } from '@/components/ui/card'
import PropertyPrice from '@/features/properties/components/PropertyPrice'
import PropertyPublisher from '@/features/properties/components/PropertyPublisher'
import type { Property } from '@/features/properties/types/property.types'
import { propertyContactPath } from '@/shared/constants/routes'

interface PropertyContactCardProps {
  property: Property
}

/** Columna de la ficha: precio, quién publica y qué se puede hacer con el anuncio. */
const PropertyContactCard = ({ property }: PropertyContactCardProps) => {
  return (
    <Card className="gap-5 p-5">
      <PropertyPrice property={property} className="text-3xl" />
      <PropertyPublisher property={property} />

      <div className="grid gap-2">
        <ButtonLink to={propertyContactPath(property.id)} size="lg" className="h-11 text-base">
          <MessageCircle />
          Contactar al anunciante
        </ButtonLink>
      </div>
    </Card>
  )
}

export default PropertyContactCard
