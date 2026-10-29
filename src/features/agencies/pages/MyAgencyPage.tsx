import { Building2, TriangleAlert } from 'lucide-react'
import ButtonLink from '@/components/ButtonLink'
import PageHeader from '@/components/PageHeader'
import PageLoading from '@/components/PageLoading'
import PageMessage from '@/components/PageMessage'
import TextLink from '@/components/TextLink'
import Container from '@/components/layout/Container'
import AgencyForm from '@/features/agencies/components/AgencyForm'
import { agencyService } from '@/features/agencies/services/agencyService'
import type { AgencyService } from '@/features/agencies/services/agencyService'
import { useAsyncData } from '@/hooks/useAsyncData'
import { usePageTitle } from '@/hooks/usePageTitle'
import { ROUTES, agencyPath } from '@/shared/constants/routes'

interface MyAgencyPageProps {
  service?: AgencyService
}

/** Donde una inmobiliaria arma su perfil público: nombre, logo, contacto y la dirección de su página. */
const MyAgencyPage = ({ service = agencyService }: MyAgencyPageProps) => {
  const { data, isLoading, error } = useAsyncData(() => service.getOwn(), 'my-agency')
  usePageTitle('Mi inmobiliaria')

  if (isLoading) return <PageLoading />

  if (error || !data) {
    return (
      <PageMessage icon={TriangleAlert} title="No pudimos cargar tu inmobiliaria" description="Inténtalo de nuevo en unos minutos." />
    )
  }

  if (!data.eligible) {
    return (
      <PageMessage
        icon={Building2}
        title="El perfil de inmobiliaria es parte de sus planes"
        description="Con un plan para inmobiliarias, tus anuncios y proyectos salen con tu nombre comercial y tu logo, y tienes tu propia página."
      >
        <ButtonLink to={ROUTES.agencyPlans}>Ver los planes para inmobiliarias</ButtonLink>
      </PageMessage>
    )
  }

  return (
    <Container className="grid max-w-3xl gap-8 py-10">
      <PageHeader
        title="Mi inmobiliaria"
        description="Con estos datos y tu logo salen tus anuncios y tus proyectos, y se arma tu página en el sitio."
      />
      {data.agency && (
        <TextLink to={agencyPath(data.agency.slug)} className="justify-self-start">
          Ver mi página
        </TextLink>
      )}
      <AgencyForm agency={data.agency} onSubmit={(profile) => service.saveOwn(profile)} />
    </Container>
  )
}

export default MyAgencyPage
