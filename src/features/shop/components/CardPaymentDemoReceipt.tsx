import { CircleCheck } from 'lucide-react'
import ButtonLink from '@/components/ButtonLink'
import DetailRows from '@/features/shop/components/DetailRows'
import type { AgentPlan } from '@/features/shop/types/plan.types'
import { ROUTES } from '@/shared/constants/routes'

interface CardPaymentDemoReceiptProps {
  plan: AgentPlan
  /** El importe, ya escrito: "L 688.85". */
  total: string
  /** Los cuatro últimos dígitos de la tarjeta de muestra. */
  lastDigits: string
}

/**
 * La confirmación de muestra tras el pago de demostración. Dice a la vista que no hubo cobro: enseña el
 * diseño de la confirmación, no un pago.
 */
const CardPaymentDemoReceipt = ({ plan, total, lastDigits }: CardPaymentDemoReceiptProps) => {
  return (
    <div role="status" className="grid justify-items-center gap-5 rounded-2xl border bg-card p-6 text-center sm:p-8">
      <CircleCheck className="size-12 text-primary" aria-hidden="true" />
      <div className="grid gap-2">
        <h2 className="font-heading text-2xl font-semibold tracking-tight">Pago de demostración</h2>
        <p className="max-w-md text-sm text-muted-foreground">
          Así se verá la confirmación cuando el pago con tarjeta esté activo. No se hizo ningún cobro.
        </p>
      </div>

      <DetailRows
        className="w-full max-w-sm border-t pt-4 text-left"
        rows={[
          { label: 'Plan', value: plan.name },
          { label: 'Total al mes', value: total },
          { label: 'Forma de pago', value: `Tarjeta terminada en ${lastDigits}` },
        ]}
      />

      <ButtonLink to={ROUTES.agentPlans} variant="outline">
        Ver los planes para agentes
      </ButtonLink>
    </div>
  )
}

export default CardPaymentDemoReceipt
