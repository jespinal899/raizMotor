import { SearchX } from 'lucide-react'
import { useParams } from 'react-router-dom'
import BackLink from '@/components/BackLink'
import ButtonLink from '@/components/ButtonLink'
import PageHeader from '@/components/PageHeader'
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

  usePageTitle(plan ? `Contratar ${plan.name}` : NOT_FOUND_TITLE)

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
    <Container className="grid max-w-3xl gap-8 py-10">
      <div className="grid gap-4">
        <BackLink to={ROUTES.agentPlans}>{BACK_TO_PLANS}</BackLink>
        <PageHeader
          title="Contratar"
          highlight={plan.name}
          description="Tres pasos: tus datos, el resumen con la forma de pago y la confirmación."
        />
      </div>

      {/* La clave reinicia el formulario al pasar de un plan a otro. */}
      <CheckoutSteps key={plan.id} plan={plan} />

      <PlanHelp question="¿Tienes dudas sobre este plan?" action="Escríbenos" to={planContactPath(plan.id)} />
    </Container>
  )
}

export default AgentPlanCheckoutPage
