import { CircleAlert, House, Pencil } from 'lucide-react'
import ButtonLink from '@/components/ButtonLink'
import EmptyState from '@/components/EmptyState'
import PageHeader from '@/components/PageHeader'
import PageLoading from '@/components/PageLoading'
import PageMessage from '@/components/PageMessage'
import Container from '@/components/layout/Container'
import DeletePropertyButton from '@/features/properties/components/DeletePropertyButton'
import PropertyCard from '@/features/properties/components/PropertyCard'
import { useMyProperties } from '@/features/properties/hooks/useMyProperties'
import { usePageTitle } from '@/hooks/usePageTitle'
import { ROUTES, editPropertyPath } from '@/shared/constants/routes'

/** Los anuncios de quien usa el sitio: cómo se ven en el catálogo y cómo eliminar cada uno. */
const MyPropertiesPage = () => {
  const { properties, isLoading, error, remove } = useMyProperties()
  usePageTitle('Mis anuncios')

  if (isLoading) return <PageLoading />

  if (error) {
    return (
      <PageMessage
        icon={CircleAlert}
        title="No pudimos cargar tus anuncios"
        description="Revisa tu conexión y vuelve a intentarlo en unos minutos."
      >
        <ButtonLink to={ROUTES.home}>Ir al inicio</ButtonLink>
      </PageMessage>
    )
  }

  return (
    <Container className="grid gap-8 py-10">
      <PageHeader
        title="Mis anuncios"
        description="Así se ven en el catálogo. Puedes corregirlos, o eliminar uno para dejar libre su lugar en tu plan."
      />

      {properties.length === 0 ? (
        <EmptyState
          icon={House}
          title="Aún no tienes anuncios"
          description="Cuando publiques una propiedad aparecerá aquí."
        >
          <ButtonLink to={ROUTES.pricing}>Publicar una propiedad</ButtonLink>
        </EmptyState>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <li key={property.id} className="grid content-start gap-3">
              <PropertyCard property={property} />
              <div className="grid grid-cols-2 gap-2">
                <ButtonLink to={editPropertyPath(property.id)} variant="outline">
                  <Pencil />
                  Editar
                </ButtonLink>
                <DeletePropertyButton title={property.title} onDelete={() => remove(property.id)} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Container>
  )
}

export default MyPropertiesPage
