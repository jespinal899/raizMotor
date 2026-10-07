import PageHeader from '@/components/PageHeader'
import Container from '@/components/layout/Container'
import PlanHelp from '@/features/shop/components/PlanHelp'
import PlanList from '@/features/shop/components/PlanList'
import { PLANS } from '@/features/shop/data/plans.data'
import { usePageTitle } from '@/hooks/usePageTitle'

const PricingPage = () => {
  usePageTitle('Planes')

  return (
    <Container className="grid gap-10 py-10">
      <PageHeader
        title="Publica tu propiedad en"
        highlight="simples pasos"
        description="Elige el plan que mejor se adapte a tus necesidades. Empieza gratis hoy mismo y llega a miles de personas."
        centered
      />

      <PlanList plans={PLANS} accented className="md:grid-cols-2 lg:grid-cols-3">
        {(plan) => <p className="text-sm leading-relaxed text-muted-foreground">{plan.description}</p>}
      </PlanList>

      <PlanHelp />
    </Container>
  )
}

export default PricingPage
