import { useNavigate } from 'react-router-dom'
import PageHeader from '@/components/PageHeader'
import Container from '@/components/layout/Container'
import { Toaster } from '@/components/ui/sonner'
import PropertyForm from '@/features/properties/components/PropertyForm'
import { publicationService } from '@/features/properties/services/publicationService'
import { usePageTitle } from '@/hooks/usePageTitle'
import { propertyDetailPath } from '@/shared/constants/routes'

const PublishPropertyPage = () => {
  const navigate = useNavigate()
  usePageTitle('Publicar propiedad')

  const publish = async (publication: Parameters<typeof publicationService.publish>[0], operationKey: string) => {
    const id = await publicationService.publish(publication, operationKey)
    navigate(propertyDetailPath(id))
  }

  return (
    <Container className="grid max-w-3xl gap-8 py-10">
      <PageHeader
        title="Publica tu propiedad"
        description="Completa los datos del anuncio: ubicación, características, descripción, precio y fotos."
      />
      <PropertyForm onSubmit={publish} />
      {/* Avisos flotantes del formulario, como el de la ubicación guardada. */}
      <Toaster />
    </Container>
  )
}

export default PublishPropertyPage
