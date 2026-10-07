import { Check } from 'lucide-react'

interface PlanFeaturesProps {
  features: string[]
}

/** Lo que incluye un plan. */
const PlanFeatures = ({ features }: PlanFeaturesProps) => {
  return (
    <ul className="grid gap-2.5 text-sm">
      {features.map((feature) => (
        <li key={feature} className="flex items-start gap-2">
          <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
          {feature}
        </li>
      ))}
    </ul>
  )
}

export default PlanFeatures
