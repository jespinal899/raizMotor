import { CONVERSION_NOTE } from '@/shared/constants/currency'
import { formatLempiras, formatLempirasInDollars } from '@/shared/utils/format'

const detailStyle = 'text-sm text-muted-foreground'

/** El precio se anuncia sin el impuesto sobre ventas (ISV), que se suma al cobrar. */
const TAX_NOTE = '+ ISV mensual'

interface PlanMonthlyPriceProps {
  lempiras: number
}

/**
 * El precio mensual de un plan en sus dos monedas: en lempiras, que es como se cobra, y debajo su
 * equivalente aproximado en dólares.
 */
const PlanMonthlyPrice = ({ lempiras }: PlanMonthlyPriceProps) => {
  return (
    <div className="grid gap-0.5">
      {/* Los espacios dentro de cada parte mantienen legible el texto para lectores de pantalla y al copiarlo. */}
      <p className="flex flex-wrap items-baseline gap-x-1.5">
        <span className="font-heading text-4xl font-semibold tracking-tight text-primary">
          {formatLempiras(lempiras)}
        </span>
        <span className={detailStyle}> {TAX_NOTE}</span>
      </p>
      <p title={CONVERSION_NOTE} className={detailStyle}>
        ≈ {formatLempirasInDollars(lempiras)}
      </p>
    </div>
  )
}

export default PlanMonthlyPrice
