import ButtonLink from '@/components/ButtonLink'
import Container from '@/components/layout/Container'
import PlanList from '@/features/shop/components/PlanList'
import { PLANS } from '@/features/shop/data/plans.data'
import { usePageTitle } from '@/hooks/usePageTitle'
import { ROUTES } from '@/shared/constants/routes'

const PricingPage = () => {
  usePageTitle('Planes')

  return (
    <Container className="grid gap-10 py-10">
      <header className="grid max-w-2xl gap-3">
        <h1 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">Planes</h1>
        <p className="text-muted-foreground">
          Planes que se adaptan tanto a quien publica una sola propiedad como a quien gestiona cientos.
        </p>
      </header>

      <PlanList plans={PLANS} />

      <p className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
        ¿No sabes cuál te conviene?
        <ButtonLink to={ROUTES.contact} variant="link" className="h-auto p-0">
          Escríbenos y te ayudamos a elegir
        </ButtonLink>
      </p>
    </Container>
  )
}

export default PricingPage
