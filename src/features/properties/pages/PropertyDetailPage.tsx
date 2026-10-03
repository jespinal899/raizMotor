import { SearchX, TriangleAlert } from 'lucide-react'
import { useParams } from 'react-router-dom'
import ButtonLink from '@/components/ButtonLink'
import PageMessage from '@/components/PageMessage'
import PropertyDetail from '@/features/properties/components/PropertyDetail'
import PropertyDetailSkeleton from '@/features/properties/components/PropertyDetailSkeleton'
import { useProperty } from '@/features/properties/hooks/useProperty'
import { usePageTitle } from '@/hooks/usePageTitle'
import { ROUTES } from '@/shared/constants/routes'

const NOT_FOUND_TITLE = 'Esta propiedad ya no está disponible'

const PropertyDetailPage = () => {
  const { id = '' } = useParams()
  const { property, isLoading, error } = useProperty(id)
  const isMissing = !isLoading && !error && !property
  const pageTitle = isMissing ? NOT_FOUND_TITLE : property?.title

  usePageTitle(pageTitle)

  if (error) {
    return (
      <PageMessage
        icon={TriangleAlert}
        title="No pudimos cargar la propiedad"
        description="Inténtalo de nuevo en unos minutos."
      />
    )
  }

  if (isLoading) return <PropertyDetailSkeleton />

  if (!property) {
    return (
      <PageMessage
        icon={SearchX}
        title={NOT_FOUND_TITLE}
        description="Puede que el anuncio se haya retirado o que el enlace esté incompleto."
      >
        <ButtonLink to={ROUTES.properties}>Ver todas las propiedades</ButtonLink>
      </PageMessage>
    )
  }

  // La clave reinicia la galería al pasar de una propiedad a otra.
  return <PropertyDetail key={property.id} property={property} />
}

export default PropertyDetailPage
