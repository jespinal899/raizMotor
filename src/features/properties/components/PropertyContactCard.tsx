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

/**
 * Tarjeta de la ficha: el formulario para cotizar y, debajo, quién publica y cómo escribirle. Va apretada
 * a propósito: tiene que caber entera en la primera pantalla, junto a las fotos.
 */
const PropertyContactCard = ({ property }: PropertyContactCardProps) => {
  const { id } = property

  return (
    <Card className="gap-4 p-5 lg:py-4">
      <PropertyQuoteForm
        onSubmit={(applicant, operationKey) => quoteService.request({ propertyId: id, ...applicant }, operationKey)}
      />

      <div className="flex items-center gap-3 border-t pt-3">
        <PropertyPublisher property={property} />
        {/* `ml-auto`: a la derecha también cuando no se sabe quién publica y el enlace queda solo en la fila. */}
        <ButtonLink
          to={propertyContactPath(id)}
          variant="outline"
          size="lg"
          aria-label="Contactar al anunciante"
          className="ml-auto h-10 shrink-0 px-3"
        >
          <MessageCircle />
          Contactar
        </ButtonLink>
      </div>
    </Card>
  )
}

export default PropertyContactCard
