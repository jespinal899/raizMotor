import { CircleCheck, Globe, Info } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import ButtonLink from '@/components/ButtonLink'
import PageHeader from '@/components/PageHeader'
import PageLoading from '@/components/PageLoading'
import PageMessage from '@/components/PageMessage'
import StatusAlert from '@/components/StatusAlert'
import Container from '@/components/layout/Container'
import { Toaster } from '@/components/ui/sonner'
import PropertyForm from '@/features/properties/components/PropertyForm'
import { ADS_SHARED } from '@/features/properties/services/propertyRepository'
import { publicationService } from '@/features/properties/services/publicationService'
import type { PropertyPublication } from '@/features/properties/types/publication.types'
import {
  MAX_FREE_PUBLICATIONS,
  describeLimitReached,
  hasReachedLimit,
} from '@/features/properties/utils/publicationLimit'
import { useAsyncData } from '@/hooks/useAsyncData'
import { usePageTitle } from '@/hooks/usePageTitle'
import { ROUTES, propertyDetailPath } from '@/shared/constants/routes'

const LOCAL_ONLY_NOTE = {
  icon: Info,
  title: 'Tu anuncio se guardará solo en este navegador',
  description:
    'Todavía no hay un servidor que lo comparta: podrás verlo tú en el catálogo desde este dispositivo, ' +
    'pero otras personas no podrán verlo.',
}

const PUBLIC_NOTE = {
  icon: Globe,
  title: 'Tu anuncio será público',
  description:
    'Cualquier visitante podrá ver sus fotos, la dirección y el punto del mapa, y escribirte por WhatsApp ' +
    'al teléfono de tu cuenta.',
}

/** Lo que ya se publicó y lo que el plan admite: se lee una vez por visita a la página. */
const QUOTA_KEY = 'quota'
const loadQuota = async () => {
  const [published, limit] = await Promise.all([publicationService.listPublished(), publicationService.getLimit()])

  return { published, limit }
}

const NO_QUOTA = { published: [] as string[], limit: MAX_FREE_PUBLICATIONS }

const PublishPropertyPage = () => {
  const navigate = useNavigate()
  // Si no se puede leer lo publicado se muestra el formulario: el fallo se avisa al intentar publicar.
  const { data: { published, limit } = NO_QUOTA, isLoading } = useAsyncData(loadQuota, QUOTA_KEY)
  usePageTitle('Publicar propiedad')

  /** Tras guardar el anuncio se abre su ficha, para que la persona vea cómo quedó. */
  const publish = async (publication: PropertyPublication, operationKey: string) => {
    const id = await publicationService.publish(publication, operationKey)
    await navigate(propertyDetailPath(id))
  }

  if (isLoading) return <PageLoading />

  // Se avisa antes de que nadie rellene un formulario que no se va a poder guardar.
  if (hasReachedLimit(published.length, limit)) {
    return (
      <PageMessage icon={CircleCheck} {...describeLimitReached(limit, ADS_SHARED ? 'tu cuenta' : 'este navegador')}>
        <ButtonLink to={ROUTES.myProperties}>Ver mis anuncios</ButtonLink>
        <ButtonLink to={ROUTES.pricing} variant="outline">
          Ver los planes
        </ButtonLink>
      </PageMessage>
    )
  }

  return (
    <Container className="grid max-w-3xl gap-8 py-10">
      <PageHeader
        title="Publica tu propiedad"
        description="Completa los datos del anuncio: ubicación, características, descripción, precio y fotos."
      />
      {/* Se avisa antes de que nadie rellene el formulario, no solo al terminar. */}
      <StatusAlert role="note" {...(ADS_SHARED ? PUBLIC_NOTE : LOCAL_ONLY_NOTE)} />
      <PropertyForm onSubmit={publish} />
      {/* Avisos flotantes del formulario, como el de la ubicación guardada. */}
      <Toaster />
    </Container>
  )
}

export default PublishPropertyPage
