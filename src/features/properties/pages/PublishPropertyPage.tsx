import PageHeader from '@/components/PageHeader'
import Container from '@/components/layout/Container'
import { Toaster } from '@/components/ui/sonner'
import PropertyForm from '@/features/properties/components/PropertyForm'
import { publicationService } from '@/features/properties/services/publicationService'
import { usePageTitle } from '@/hooks/usePageTitle'

const PublishPropertyPage = () => {
  usePageTitle('Publicar propiedad')

  return (
    <Container className="grid max-w-3xl gap-8 py-10">
      <PageHeader
        title="Publica tu propiedad"
        description="Completa los datos del anuncio: ubicación, características, descripción, precio y fotos."
      />
      <PropertyForm
        onSubmit={(publication, operationKey) => publicationService.publish(publication, operationKey)}
      />
      {/* Avisos flotantes del formulario, como el de la ubicación guardada. */}
      <Toaster />
    </Container>
  )
}

export default PublishPropertyPage
