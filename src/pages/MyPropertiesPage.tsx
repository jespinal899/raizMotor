import { CircleAlert } from 'lucide-react'
import ButtonLink from '@/components/ButtonLink'
import PageHeader from '@/components/PageHeader'
import PageLoading from '@/components/PageLoading'
import PageMessage from '@/components/PageMessage'
import Container from '@/components/layout/Container'
import PublicationActions from '@/features/properties/components/PublicationActions'
import PublicationTabs from '@/features/properties/components/PublicationTabs'
import { useMyProperties } from '@/features/properties/hooks/useMyProperties'
import type { Property } from '@/features/properties/types/property.types'
import PlanUsageBanner from '@/features/shop/components/PlanUsageBanner'
import { usePageTitle } from '@/hooks/usePageTitle'
import { ROUTES } from '@/shared/constants/routes'

/**
 * Las publicaciones de quien usa el sitio: su plan y cuánto lleva usado y, en dos pestañas, las que están
 * en el catálogo y las que no, con lo que puede hacer con cada una.
 *
 * Vive aquí, y no en una funcionalidad, porque reúne piezas de dos: los anuncios son de Propiedades y el
 * plan es de Planes. Así ninguna de las dos pasa a depender de la otra por esta página.
 */
const MyPropertiesPage = () => {
  const { published, unpublished, limit, isLoading, error, unpublish, republish, remove } = useMyProperties()
  usePageTitle('Mis publicaciones')

  if (isLoading) return <PageLoading />

  if (error) {
    return (
      <PageMessage
        icon={CircleAlert}
        title="No pudimos cargar tus publicaciones"
        description="Revisa tu conexión y vuelve a intentarlo en unos minutos."
      >
        <ButtonLink to={ROUTES.home}>Ir al inicio</ButtonLink>
      </PageMessage>
    )
  }

  const renderActions = (property: Property) => (
    <PublicationActions
      property={property}
      onUnpublish={() => unpublish(property.id)}
      onRepublish={() => republish(property.id)}
      onRemove={() => remove(property.id)}
    />
  )

  return (
    <Container className="grid gap-8 py-10">
      <PageHeader
        title="Mis publicaciones"
        description="Las que están en el catálogo y las que retiraste de él. Puedes corregirlas, despublicarlas o eliminarlas."
      />

      {/* Solo las publicadas ocupan el plan: despublicar una deja libre su lugar. */}
      <PlanUsageBanner published={published.length} limit={limit} />

      <PublicationTabs
        groups={[
          { id: 'publicadas', title: 'Publicadas', properties: published, empty: 'No tienes publicaciones en el catálogo.' },
          {
            id: 'despublicadas',
            title: 'Despublicadas',
            properties: unpublished,
            empty: 'No tienes publicaciones despublicadas.',
          },
        ]}
        renderActions={renderActions}
      />
    </Container>
  )
}

export default MyPropertiesPage
