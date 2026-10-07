import { CircleCheck, Info } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import ButtonLink from '@/components/ButtonLink'
import PageHeader from '@/components/PageHeader'
import PageLoading from '@/components/PageLoading'
import PageMessage from '@/components/PageMessage'
import StatusAlert from '@/components/StatusAlert'
import Container from '@/components/layout/Container'
import { Toaster } from '@/components/ui/sonner'
import PropertyForm from '@/features/properties/components/PropertyForm'
import { publicationService } from '@/features/properties/services/publicationService'
import type { PropertyPublication } from '@/features/properties/types/publication.types'
import { FREE_LIMIT_REACHED, hasReachedFreeLimit } from '@/features/properties/utils/publicationLimit'
import { useAsyncData } from '@/hooks/useAsyncData'
import { usePageTitle } from '@/hooks/usePageTitle'
import { ROUTES, propertyDetailPath } from '@/shared/constants/routes'

const LOCAL_ONLY_NOTE = {
  title: 'Tu anuncio se guardará solo en este navegador',
  description:
    'Todavía no hay un servidor que lo comparta: podrás verlo tú en el catálogo desde este dispositivo, ' +
    'pero otras personas no podrán verlo.',
}

/** La lista se lee una vez por visita a la página. */
const PUBLISHED_KEY = 'published'
const loadPublished = () => publicationService.listPublished()

const PublishPropertyPage = () => {
  const navigate = useNavigate()
  // Si no se puede leer lo guardado se muestra el formulario: el fallo se avisa al intentar publicar.
  const { data: published = [], isLoading } = useAsyncData(loadPublished, PUBLISHED_KEY)
  usePageTitle('Publicar propiedad')

  /** Tras guardar el anuncio se abre su ficha, para que la persona vea cómo quedó. */
  const publish = async (publication: PropertyPublication, operationKey: string) => {
    const id = await publicationService.publish(publication, operationKey)
    await navigate(propertyDetailPath(id))
  }

  if (isLoading) return <PageLoading />

  // Se avisa antes de que nadie rellene un formulario que no se va a poder guardar.
  if (hasReachedFreeLimit(published.length)) {
    return (
      <PageMessage
        icon={CircleCheck}
        title={FREE_LIMIT_REACHED.title}
        description={`${FREE_LIMIT_REACHED.reason} y este navegador ya tiene una.`}
      >
        <ButtonLink to={propertyDetailPath(published[0])}>Ver mi publicación</ButtonLink>
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
      <StatusAlert role="note" icon={Info} {...LOCAL_ONLY_NOTE} />
      <PropertyForm onSubmit={publish} />
      {/* Avisos flotantes del formulario, como el de la ubicación guardada. */}
      <Toaster />
    </Container>
  )
}

export default PublishPropertyPage
