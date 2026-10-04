import PlanCard from '@/features/shop/components/PlanCard'
import type { Plan } from '@/features/shop/types/plan.types'

interface PlanListProps {
  plans: Plan[]
}

const PlanList = ({ plans }: PlanListProps) => {
  return (
    <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {plans.map((plan) => (
        <li key={plan.id}>
          <PlanCard plan={plan} />
        </li>
      ))}
    </ul>
  )
}

export default PlanList
