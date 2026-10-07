import { ArrowLeft } from 'lucide-react'
import PageHeader from '@/components/PageHeader'
import TextLink from '@/components/TextLink'
import Container from '@/components/layout/Container'
import PlanFeatures from '@/features/shop/components/PlanFeatures'
import PlanHelp from '@/features/shop/components/PlanHelp'
import PlanList from '@/features/shop/components/PlanList'
import PlanMonthlyPrice from '@/features/shop/components/PlanMonthlyPrice'
import { AGENT_PLANS } from '@/features/shop/data/plans.data'
import { usePageTitle } from '@/hooks/usePageTitle'
import { ROUTES } from '@/shared/constants/routes'

const TITLE = 'Planes para agentes inmobiliarios'

const AgentPlansPage = () => {
  usePageTitle(TITLE)

  return (
    <Container className="grid gap-10 py-10">
      <div className="grid gap-4">
        <TextLink to={ROUTES.pricing} className="justify-self-start">
          <ArrowLeft aria-hidden="true" />
          Ver todos los planes
        </TextLink>
        <PageHeader title={TITLE} description="Elige el plan según la cantidad de propiedades que quieres publicar." />
      </div>

      <PlanList plans={AGENT_PLANS} className="max-w-3xl md:grid-cols-2">
        {(plan) => (
          <>
            <PlanFeatures features={plan.features} />
            <PlanMonthlyPrice lempiras={plan.monthlyPrice} />
          </>
        )}
      </PlanList>

      <PlanHelp />
    </Container>
  )
}

export default AgentPlansPage
