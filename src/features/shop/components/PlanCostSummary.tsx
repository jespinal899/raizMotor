import type { ReactNode } from 'react'
import FormSection from '@/components/FormSection'
import DetailRows from '@/features/shop/components/DetailRows'
import type { AgentPlan } from '@/features/shop/types/plan.types'
import { formatPriceBeforeTax, toPlanTotal } from '@/features/shop/utils/planTotal'
import { ISV_RATE } from '@/shared/constants/tax'
import { formatLempirasExact } from '@/shared/utils/format'

const TAX_LABEL = `ISV (${Math.round(ISV_RATE * 100)} %)`

interface PlanCostSummaryProps {
  plan: AgentPlan
  /** Lo que el paso necesite debajo del total, como las casillas del resumen. */
  children?: ReactNode
}

/** El resumen de compra: qué plan se contrata y cuánto se paga cada mes, con el impuesto desglosado. */
const PlanCostSummary = ({ plan, children }: PlanCostSummaryProps) => {
  const { price, tax, total } = toPlanTotal(plan.monthlyPrice)

  return (
    <FormSection titleAs="h3" title="Resumen de compra">
      <div className="grid gap-0.5">
        <p className="flex items-baseline justify-between gap-4">
          <span className="font-heading text-lg font-semibold text-primary">{plan.name}</span>
          {/* El espacio de delante mantiene legible el texto para lectores de pantalla y al copiarlo. */}
          <span className="text-sm font-medium whitespace-nowrap"> {formatPriceBeforeTax(price)}</span>
        </p>
        <p className="text-sm text-muted-foreground">Suscripción mensual</p>
      </div>

      <div className="grid gap-3 border-t pt-4">
        <DetailRows
          rows={[
            { label: 'Subtotal', value: formatLempirasExact(price) },
            { label: TAX_LABEL, value: formatLempirasExact(tax) },
          ]}
        />
        <dl className="flex items-baseline justify-between gap-4 border-t pt-3 text-sm font-semibold">
          <dt>Total</dt>
          <dd className="font-heading text-xl text-primary">{formatLempirasExact(total)}</dd>
        </dl>
      </div>

      {children && <div className="grid gap-4 border-t pt-4">{children}</div>}
    </FormSection>
  )
}

export default PlanCostSummary
