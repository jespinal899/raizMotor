import { SearchX } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import ButtonLink from '@/components/ButtonLink'
import PageHeader from '@/components/PageHeader'
import PageLoading from '@/components/PageLoading'
import PageMessage from '@/components/PageMessage'
import Container from '@/components/layout/Container'
import { Toaster } from '@/components/ui/sonner'
import PropertyForm from '@/features/properties/components/PropertyForm'
import { publicationService } from '@/features/properties/services/publicationService'
import type { PropertyPublication } from '@/features/properties/types/publication.types'
import { toFormValues } from '@/features/properties/utils/toFormValues'
import { useAsyncData } from '@/hooks/useAsyncData'
import { usePageTitle } from '@/hooks/usePageTitle'
import { ROUTES, propertyDetailPath } from '@/shared/constants/routes'

/** El mismo formulario de publicar, abierto con los datos de un anuncio propio para corregirlos. */
const EditPropertyPage = () => {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { data: publication, isLoading } = useAsyncData(() => publicationService.getOwnPublication(id), `editable:${id}`)
  usePageTitle('Editar anuncio')

  /** Tras guardar se abre la ficha, para que la persona vea cómo quedó. */
  const save = async (changes: PropertyPublication, operationKey: string) => {
    await publicationService.update(id, changes, operationKey)
    await navigate(propertyDetailPath(id))
  }

  if (isLoading) return <PageLoading />

  // Tampoco se abre si no se pudo leer: editar a ciegas un anuncio sería guardarlo vacío.
  if (!publication) {
    return (
      <PageMessage
        icon={SearchX}
        title="No puedes editar ese anuncio"
        description="Ya no existe, o no lo publicaste con esta cuenta."
      >
        <ButtonLink to={ROUTES.myProperties}>Ver mis anuncios</ButtonLink>
      </PageMessage>
    )
  }

  return (
    <Container className="grid max-w-3xl gap-8 py-10">
      <PageHeader title="Edita tu anuncio" description="Corrige lo que haga falta y guarda los cambios en el último paso." />
      <PropertyForm editing initialValues={toFormValues(publication)} onSubmit={save} />
      {/* Avisos flotantes del formulario, como el de la ubicación guardada. */}
      <Toaster />
    </Container>
  )
}

export default EditPropertyPage
