import { MessageCircle } from 'lucide-react'
import ButtonLink from '@/components/ButtonLink'
import { Card } from '@/components/ui/card'
import PropertyPublisher from '@/features/properties/components/PropertyPublisher'
import PropertyQuoteForm from '@/features/properties/components/PropertyQuoteForm'
import { quoteService } from '@/features/properties/services/quoteService'
import type { Property } from '@/features/properties/types/property.types'
import { propertyContactPath } from '@/shared/constants/routes'

interface PropertyContactCardProps {
  property: Property
}

/** Tarjeta de la ficha: el formulario para cotizar y, debajo, quién publica y cómo escribirle. */
const PropertyContactCard = ({ property }: PropertyContactCardProps) => {
  const { id } = property

  return (
    <Card className="gap-5 p-5">
      <PropertyQuoteForm
        onSubmit={(applicant, operationKey) => quoteService.request({ propertyId: id, ...applicant }, operationKey)}
      />

      <PropertyPublisher property={property} />

      <ButtonLink to={propertyContactPath(id)} variant="outline" size="lg" className="h-11 text-base">
        <MessageCircle />
        Contactar al anunciante
      </ButtonLink>
    </Card>
  )
}

export default PropertyContactCard
