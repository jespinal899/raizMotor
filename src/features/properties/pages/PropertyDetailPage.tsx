import { SearchX, TriangleAlert } from 'lucide-react'
import { useParams } from 'react-router-dom'
import ButtonLink from '@/components/ButtonLink'
import EmptyState from '@/components/EmptyState'
import PropertyDetail from '@/features/properties/components/PropertyDetail'
import PropertyDetailSkeleton from '@/features/properties/components/PropertyDetailSkeleton'
import { useProperty } from '@/features/properties/hooks/useProperty'
import { usePageTitle } from '@/hooks/usePageTitle'
import { ROUTES } from '@/shared/constants/routes'

const NOT_FOUND_TITLE = 'Esta propiedad ya no está disponible'
const messageLayout = 'mx-auto max-w-2xl px-4 py-16'

const PropertyDetailPage = () => {
  const { id = '' } = useParams()
  const { property, isLoading, error } = useProperty(id)
  const notFound = !isLoading && !error && !property

  usePageTitle(property?.title ?? (notFound ? NOT_FOUND_TITLE : undefined))

  if (error) {
    return (
      <div className={messageLayout}>
        <EmptyState
          icon={TriangleAlert}
          titleAs="h1"
          title="No pudimos cargar la propiedad"
          description="Inténtalo de nuevo en unos minutos."
        />
      </div>
    )
  }

  if (isLoading) return <PropertyDetailSkeleton />

  if (!property) {
    return (
      <div className={messageLayout}>
        <EmptyState
          icon={SearchX}
          titleAs="h1"
          title={NOT_FOUND_TITLE}
          description="Puede que el anuncio se haya retirado o que el enlace esté incompleto."
        >
          <ButtonLink to={ROUTES.properties}>Ver todas las propiedades</ButtonLink>
        </EmptyState>
      </div>
    )
  }

  // La clave reinicia la galería al pasar de una propiedad a otra.
  return <PropertyDetail key={property.id} property={property} />
}

export default PropertyDetailPage
