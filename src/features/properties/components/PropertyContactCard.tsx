import { MessageCircle } from 'lucide-react'
import ButtonLink from '@/components/ButtonLink'
import { Card } from '@/components/ui/card'
import PropertyPrice from '@/features/properties/components/PropertyPrice'
import PropertyStats from '@/features/properties/components/PropertyStats'
import { ADVERTISER_KINDS } from '@/features/properties/data/propertyOptions.data'
import type { Property } from '@/features/properties/types/property.types'
import { propertyContactPath } from '@/shared/constants/routes'

interface PropertyContactCardProps {
  property: Property
}

const PropertyContactCard = ({ property }: PropertyContactCardProps) => {
  const { id, advertiser } = property

  return (
    <Card className="gap-5 p-5">
      <PropertyPrice property={property} className="text-3xl" />
      <PropertyStats property={property} withParking className="gap-x-5 gap-y-2 text-foreground" />

      {advertiser && (
        <div className="grid gap-0.5 border-t pt-5">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Publicado por</p>
          <p className="font-medium">{advertiser.name}</p>
          <p className="text-sm text-muted-foreground">{ADVERTISER_KINDS[advertiser.kind]}</p>
        </div>
      )}

      <ButtonLink to={propertyContactPath(id)} size="lg" className="h-11 text-base">
        <MessageCircle />
        Contactar al anunciante
      </ButtonLink>
    </Card>
  )
}

export default PropertyContactCard
