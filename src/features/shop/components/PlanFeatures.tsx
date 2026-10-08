import { Check } from 'lucide-react'
import type { AgentPlanFeature } from '@/features/shop/types/plan.types'

interface PlanFeaturesProps {
  features: AgentPlanFeature[]
}

/** Lo que incluye un plan. */
const PlanFeatures = ({ features }: PlanFeaturesProps) => {
  return (
    <ul className="grid gap-2.5 text-sm">
        {features.map(({ text, emphasized }) => {
          const emphasizedStart = emphasized ? text.indexOf(emphasized) : -1
          const content =
            emphasizedStart >= 0 && emphasized ? (
              <>
                {text.slice(0, emphasizedStart)}
                <strong>{emphasized}</strong>
                {text.slice(emphasizedStart + emphasized.length)}
              </>
            ) : (
              text
            )

          return (
            <li key={text} className="flex items-start gap-2">
              <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
              {content}
            </li>
          )
        })}
    </ul>
  )
}

export default PlanFeatures
