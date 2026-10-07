import { Check } from 'lucide-react'
import ButtonLink from '@/components/ButtonLink'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import type { Plan } from '@/features/shop/types/plan.types'
import { formatPlanPrice } from '@/features/shop/utils/planPrice'
import { cn } from '@/lib/utils'

const UPCOMING_NOTE = 'Estamos definiendo este plan. Escríbenos y te avisamos cuando esté listo.'

interface PlanCardProps {
  plan: Plan
}

const PlanCard = ({ plan }: PlanCardProps) => {
  const { name, audience, price, features, action, highlighted = false } = plan
  const { prefix, amount, suffix } = formatPlanPrice(price)

  return (
    <Card className={cn('h-full gap-6 p-6', highlighted && 'shadow-lg ring-2 ring-primary')}>
      <div className="grid gap-2">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-heading text-xl font-semibold">{name}</h2>
          {highlighted && <Badge>Recomendado</Badge>}
        </div>
        <p className="text-sm text-muted-foreground">{audience}</p>
      </div>

      {/* Los espacios dentro de cada parte mantienen legible el texto para lectores de pantalla y al copiarlo. */}
      <p className="flex flex-wrap items-baseline gap-x-1.5">
        {prefix && <span className="text-sm text-muted-foreground">{prefix} </span>}
        <span className="font-heading text-4xl font-semibold tracking-tight text-primary">{amount}</span>
        {suffix && <span className="text-sm text-muted-foreground"> {suffix}</span>}
      </p>

      {features.length > 0 && (
        <ul className="grid gap-2.5 text-sm">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-2">
              <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
              {feature}
            </li>
          ))}
        </ul>
      )}
      {/* De un plan sin definir no se prometen ventajas: solo se dice que está en preparación. */}
      {price.kind === 'upcoming' && <p className="text-sm text-muted-foreground">{UPCOMING_NOTE}</p>}

      <ButtonLink
        to={action.to}
        variant={highlighted ? 'default' : 'outline'}
        size="lg"
        className="mt-auto h-11 text-base"
      >
        {action.label}
      </ButtonLink>
    </Card>
  )
}

export default PlanCard
