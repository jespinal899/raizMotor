import type { ReactNode } from 'react'
import PlanCard from '@/features/shop/components/PlanCard'
import type { ListedPlan } from '@/features/shop/types/plan.types'
import { cn } from '@/lib/utils'

interface PlanListProps<Item extends ListedPlan> {
  plans: Item[]
  /** Las columnas de la cuadrícula, según cuántos planes se muestran. */
  className?: string
  /** Lo que va dentro de la tarjeta de cada plan, entre su nombre y su botón. */
  children: (plan: Item) => ReactNode
}

const PlanList = <Item extends ListedPlan>({ plans, className, children }: PlanListProps<Item>) => {
  return (
    <ul className={cn('grid gap-6', className)}>
      {plans.map((plan) => (
        <li key={plan.id}>
          <PlanCard name={plan.name} action={plan.action}>
            {children(plan)}
          </PlanCard>
        </li>
      ))}
    </ul>
  )
}

export default PlanList
