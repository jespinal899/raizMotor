import { SearchX } from 'lucide-react'
import { useParams } from 'react-router-dom'
import BackLink from '@/components/BackLink'
import ButtonLink from '@/components/ButtonLink'
import PageMessage from '@/components/PageMessage'
import Container from '@/components/layout/Container'
import CheckoutSteps from '@/features/shop/components/CheckoutSteps'
import PlanHelp from '@/features/shop/components/PlanHelp'
import { AGENT_PLANS } from '@/features/shop/data/plans.data'
import { usePageTitle } from '@/hooks/usePageTitle'
import { ROUTES, planContactPath } from '@/shared/constants/routes'

const NOT_FOUND_TITLE = 'Ese plan no existe'
const BACK_TO_PLANS = 'Ver los planes para agentes'

const AgentPlanCheckoutPage = () => {
  const { plan: planId } = useParams()
  const plan = AGENT_PLANS.find(({ id }) => id === planId)
  const title = plan ? `Contratar ${plan.name}` : NOT_FOUND_TITLE

  usePageTitle(title)

  if (!plan) {
    return (
      <PageMessage
        icon={SearchX}
        title={NOT_FOUND_TITLE}
        description="Puede que el enlace esté incompleto o que el plan haya cambiado."
      >
        <ButtonLink to={ROUTES.agentPlans}>{BACK_TO_PLANS}</ButtonLink>
      </PageMessage>
    )
  }

  return (
    <Container className="grid max-w-5xl gap-8 py-10">
      <BackLink to={ROUTES.agentPlans}>{BACK_TO_PLANS}</BackLink>
      {/* La página no lleva título a la vista: empieza por el indicador de pasos y el resumen dice qué plan es. */}
      <h1 className="sr-only">{title}</h1>

      {/* La clave reinicia el formulario al pasar de un plan a otro. */}
      <CheckoutSteps key={plan.id} plan={plan} />

      <PlanHelp question="¿Tienes dudas sobre este plan?" action="Escríbenos" to={planContactPath(plan.id)} />
    </Container>
  )
}

export default AgentPlanCheckoutPage
