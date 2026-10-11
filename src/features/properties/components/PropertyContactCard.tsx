import { MessageCircle } from 'lucide-react'
import ButtonLink from '@/components/ButtonLink'
import ExternalButtonLink from '@/components/ExternalButtonLink'
import { Card } from '@/components/ui/card'
import PropertyPublisher from '@/features/properties/components/PropertyPublisher'
import PropertyQuoteForm from '@/features/properties/components/PropertyQuoteForm'
import { quoteService } from '@/features/properties/services/quoteService'
import type { Property } from '@/features/properties/types/property.types'
import { buildAdvertiserChatUrl } from '@/features/properties/utils/propertyShare'
import { useAbsoluteUrl } from '@/hooks/useAbsoluteUrl'
import { cn } from '@/lib/utils'
import { propertyContactPath, propertyDetailPath } from '@/shared/constants/routes'

interface PropertyContactCardProps {
  property: Property
}

/**
 * Tarjeta de la ficha: el formulario para que el publicador te contacte y, debajo, quién publica y cómo
 * escribirle. El formulario solo está en los anuncios de una cuenta: uno de ejemplo no es de nadie, y uno
 * guardado solo en este navegador es de quien lo está viendo. Va apretada a propósito: tiene que caber entera
 * en la primera pantalla, junto a las fotos.
 */
const PropertyContactCard = ({ property }: PropertyContactCardProps) => {
  const { id, title, advertiser, example, localOnly } = property
  const adUrl = useAbsoluteUrl(propertyDetailPath(id))
  const contactStyle = 'ml-auto h-10 shrink-0 px-3'

  return (
    <Card className="gap-4 p-5 lg:py-4">
      {!example && !localOnly && (
        <PropertyQuoteForm
          onSubmit={(applicant, operationKey) => quoteService.request({ propertyId: id, ...applicant }, operationKey)}
        />
      )}

      <div className={cn('flex items-center gap-3', !example && !localOnly && 'border-t pt-3')}>
        <PropertyPublisher property={property} />
        {/* `ml-auto`: a la derecha también cuando no se sabe quién publica y el enlace queda solo en la fila. */}
        {advertiser?.phone ? (
          // Quien publicó desde su cuenta dejó un teléfono: se le escribe a él, no al sitio.
          <ExternalButtonLink
            href={buildAdvertiserChatUrl(title, adUrl, advertiser.phone)}
            variant="outline"
            size="lg"
            aria-label="Escribir al anunciante por WhatsApp"
            className={contactStyle}
          >
            <MessageCircle />
            WhatsApp
          </ExternalButtonLink>
        ) : (
          <ButtonLink
            to={propertyContactPath(id)}
            variant="outline"
            size="lg"
            aria-label="Contactar al anunciante"
            className={contactStyle}
          >
            <MessageCircle />
            Contactar
          </ButtonLink>
        )}
      </div>
    </Card>
  )
}

export default PropertyContactCard
