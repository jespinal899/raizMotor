import FormSection from '@/components/FormSection'
import type { AgentPlan } from '@/features/shop/types/plan.types'
import { formatPriceBeforeTax } from '@/features/shop/utils/planTotal'

interface CheckoutPurchaseDetailProps {
  plan: AgentPlan
}

/** Segundo paso: cómo se paga la suscripción. Hoy hay un solo plan de pago, el mensual. */
const CheckoutPurchaseDetail = ({ plan }: CheckoutPurchaseDetailProps) => {
  return (
    <FormSection titleAs="h3" title="Detalle de compra" description="Revisa los detalles de tu suscripción.">
      <div className="grid gap-1 rounded-lg border border-primary bg-primary/5 p-4">
        <p className="font-medium">Mensual</p>
        <p className="text-sm text-muted-foreground">Facturación mensual</p>
        <p className="font-heading text-lg font-semibold text-primary">{formatPriceBeforeTax(plan.monthlyPrice)}</p>
      </div>
    </FormSection>
  )
}

export default CheckoutPurchaseDetail
