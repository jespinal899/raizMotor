import PageHeader from '@/components/PageHeader'
import TextLink from '@/components/TextLink'
import Container from '@/components/layout/Container'
import PlanList from '@/features/shop/components/PlanList'
import { PLANS } from '@/features/shop/data/plans.data'
import { usePageTitle } from '@/hooks/usePageTitle'
import { ROUTES } from '@/shared/constants/routes'

const PricingPage = () => {
  usePageTitle('Planes')

  return (
    <Container className="grid gap-10 py-10">
      <PageHeader
        title="Planes"
        description="Elige cómo quieres publicar. Hoy puedes anunciar gratis como propietario; los planes para agentes e inmobiliarias llegarán pronto."
      />

      <PlanList plans={PLANS} />

      <p className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
        ¿No sabes cuál te conviene?{' '}
        <TextLink to={ROUTES.contact}>Escríbenos y te ayudamos a elegir</TextLink>
      </p>
    </Container>
  )
}

export default PricingPage
