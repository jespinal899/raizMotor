import { formatLempiras } from '@/shared/utils/format'

/** El precio se anuncia sin el impuesto sobre ventas (ISV), que se suma al cobrar. */
const PERIOD_AND_TAX = '/mes + ISV'

interface PlanMonthlyPriceProps {
  lempiras: number
}

/** El precio mensual del plan en lempiras, que es como se cobra. */
const PlanMonthlyPrice = ({ lempiras }: PlanMonthlyPriceProps) => {
  return (
    <p className="flex flex-wrap items-baseline gap-x-1.5">
      <span className="font-heading text-4xl font-semibold tracking-tight text-primary">{formatLempiras(lempiras)}</span>
      <span className="text-sm text-muted-foreground">{PERIOD_AND_TAX}</span>
    </p>
  )
}

export default PlanMonthlyPrice
