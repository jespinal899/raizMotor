import FormSection from '@/components/FormSection'
import DetailRows from '@/features/shop/components/DetailRows'
import type { PlanRequest } from '@/features/shop/types/checkout.types'
import type { AgentPlan } from '@/features/shop/types/plan.types'
import { describePlanRequest } from '@/features/shop/utils/planRequest'

interface CheckoutReviewProps {
  plan: AgentPlan
  request: PlanRequest
}

/** Tercer paso cuando el plan se pide por WhatsApp: la solicitud completa, tal como va a salir en el mensaje. */
const CheckoutReview = ({ plan, request }: CheckoutReviewProps) => {
  return (
    <FormSection
      titleAs="h3"
      title="Revisa tu solicitud"
      description="Si algo no está bien, vuelve atrás y corrígelo."
    >
      <DetailRows rows={describePlanRequest(plan, request)} />
    </FormSection>
  )
}

export default CheckoutReview
