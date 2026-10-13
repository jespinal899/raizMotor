import { SearchX } from 'lucide-react'
import { useLocation, useParams } from 'react-router-dom'
import BackLink from '@/components/BackLink'
import ButtonLink from '@/components/ButtonLink'
import PageMessage from '@/components/PageMessage'
import Container from '@/components/layout/Container'
import CheckoutSteps from '@/features/shop/components/CheckoutSteps'
import PlanHelp from '@/features/shop/components/PlanHelp'
import { AGENCY_PLANS, AGENT_PLANS } from '@/features/shop/data/plans.data'
import { usePageTitle } from '@/hooks/usePageTitle'
import { ROUTES, planContactPath } from '@/shared/constants/routes'

const NOT_FOUND_TITLE = 'Ese plan no existe'

/** Los planes de cada página de contratación: la de agentes y la de inmobiliarias. */
const GROUPS = {
  agents: { plans: AGENT_PLANS, back: ROUTES.agentPlans, backLabel: 'Ver los planes para agentes' },
  agencies: { plans: AGENCY_PLANS, back: ROUTES.agencyPlans, backLabel: 'Ver los planes para inmobiliarias' },
}

/** Contratar un plan de pago: de agente o de inmobiliaria, según la página desde la que se llega. */
const AgentPlanCheckoutPage = () => {
  const { plan: planId } = useParams()
  const { pathname } = useLocation()
  const group = pathname.startsWith(ROUTES.agencyPlans) ? GROUPS.agencies : GROUPS.agents
  const plan = group.plans.find(({ id }) => id === planId)
  const title = plan ? `Contratar ${plan.name}` : NOT_FOUND_TITLE

  usePageTitle(title)

  if (!plan) {
    return (
      <PageMessage
        icon={SearchX}
        title={NOT_FOUND_TITLE}
        description="Puede que el enlace esté incompleto o que el plan haya cambiado."
      >
        <ButtonLink to={group.back}>{group.backLabel}</ButtonLink>
      </PageMessage>
    )
  }

  return (
    <Container className="grid max-w-5xl gap-8 py-10">
      <BackLink to={group.back}>{group.backLabel}</BackLink>
      {/* La página no lleva título a la vista: empieza por el indicador de pasos y el resumen dice qué plan es. */}
      <h1 className="sr-only">{title}</h1>

      {/* La clave reinicia el formulario al pasar de un plan a otro. */}
      <CheckoutSteps key={plan.id} plan={plan} />

      <PlanHelp question="¿Tienes dudas sobre este plan?" action="Escríbenos" to={planContactPath(plan.id)} />
    </Container>
  )
}

export default AgentPlanCheckoutPage
