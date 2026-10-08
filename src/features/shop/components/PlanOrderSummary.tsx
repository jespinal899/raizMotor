import FormSection from '@/components/FormSection'
import DetailRows from '@/features/shop/components/DetailRows'
import PlanFeatures from '@/features/shop/components/PlanFeatures'
import type { AgentPlan } from '@/features/shop/types/plan.types'
import { toPlanTotal } from '@/features/shop/utils/planTotal'
import { ISV_RATE } from '@/shared/constants/tax'
import { formatLempirasExact } from '@/shared/utils/format'

const TAX_LABEL = `ISV (${Math.round(ISV_RATE * 100)} %)`

interface PlanOrderSummaryProps {
  plan: AgentPlan
}

/** Lo que se va a contratar: el plan, lo que incluye y cuánto se paga cada mes con el impuesto ya sumado. */
const PlanOrderSummary = ({ plan }: PlanOrderSummaryProps) => {
  const { price, tax, total } = toPlanTotal(plan.monthlyPrice)

  return (
    <FormSection titleAs="h3" title="Resumen de tu plan">
      <div className="grid gap-3">
        <p className="font-heading text-xl font-semibold text-primary">{plan.name}</p>
        <PlanFeatures features={plan.features} />
      </div>

      <div className="grid gap-3 border-t pt-4">
        <DetailRows
          rows={[
            { label: 'Plan mensual', value: formatLempirasExact(price) },
            { label: TAX_LABEL, value: formatLempirasExact(tax) },
          ]}
        />
        <dl className="flex items-baseline justify-between gap-4 border-t pt-3 text-sm font-semibold">
          <dt>Total al mes</dt>
          <dd className="font-heading text-xl text-primary">{formatLempirasExact(total)}</dd>
        </dl>
      </div>
    </FormSection>
  )
}

export default PlanOrderSummary
