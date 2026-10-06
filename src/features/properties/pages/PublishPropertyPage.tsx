import { Info } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '@/components/PageHeader'
import StatusAlert from '@/components/StatusAlert'
import Container from '@/components/layout/Container'
import { Toaster } from '@/components/ui/sonner'
import PropertyForm from '@/features/properties/components/PropertyForm'
import { publicationService } from '@/features/properties/services/publicationService'
import type { PropertyPublication } from '@/features/properties/types/publication.types'
import { usePageTitle } from '@/hooks/usePageTitle'
import { propertyDetailPath } from '@/shared/constants/routes'

const LOCAL_ONLY_NOTE = {
  title: 'Tu anuncio se guardará solo en este navegador',
  description:
    'Todavía no hay un servidor que lo comparta: podrás verlo tú en el catálogo desde este dispositivo, ' +
    'pero otras personas no podrán verlo.',
}

const PublishPropertyPage = () => {
  const navigate = useNavigate()
  usePageTitle('Publicar propiedad')

  /** Tras guardar el anuncio se abre su ficha, para que la persona vea cómo quedó. */
  const publish = async (publication: PropertyPublication, operationKey: string) => {
    const id = await publicationService.publish(publication, operationKey)
    await navigate(propertyDetailPath(id))
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
