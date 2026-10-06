import { MessageCircle } from 'lucide-react'
import ButtonLink from '@/components/ButtonLink'
import { Card } from '@/components/ui/card'
import PropertyPrice from '@/features/properties/components/PropertyPrice'
import PropertyPublisher from '@/features/properties/components/PropertyPublisher'
import PropertyQuoteForm from '@/features/properties/components/PropertyQuoteForm'
import PropertyViews from '@/features/properties/components/PropertyViews'
import SharePropertyDialog from '@/features/properties/components/SharePropertyDialog'
import { quoteService } from '@/features/properties/services/quoteService'
import type { Property } from '@/features/properties/types/property.types'
import { propertyContactPath } from '@/shared/constants/routes'

interface PropertyContactCardProps {
  property: Property
}

/** Columna de la ficha: precio, compartir y vistas, el formulario para cotizar y, debajo, quién publica. */
const PropertyContactCard = ({ property }: PropertyContactCardProps) => {
  const { id } = property

  return (
    <Card className="gap-5 p-5">
      <PropertyPrice property={property} className="text-3xl" />

      <div className="flex items-center gap-3">
        <SharePropertyDialog property={property} />
        <PropertyViews propertyId={id} />
      </div>

      <div className="border-t pt-5">
        <PropertyQuoteForm
          onSubmit={(applicant, operationKey) => quoteService.request({ propertyId: id, ...applicant }, operationKey)}
        />
      </div>

      <PropertyPublisher property={property} />

      <ButtonLink to={propertyContactPath(id)} variant="outline" size="lg" className="h-11 text-base">
        <MessageCircle />
        Contactar al anunciante
      </ButtonLink>
    </Card>
  )
}

export default PropertyContactCard
