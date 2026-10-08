import { Check } from 'lucide-react'
import type { AgentPlanFeature } from '@/features/shop/types/plan.types'

/** El texto de un punto, con su tramo destacado en negrita si forma parte de él. */
const FeatureText = ({ text, emphasized }: AgentPlanFeature) => {
  const start = emphasized ? text.indexOf(emphasized) : -1
  if (!emphasized || start < 0) return text

  return (
    <>
      {text.slice(0, start)}
      <strong>{emphasized}</strong>
      {text.slice(start + emphasized.length)}
    </>
  )
}

interface PlanFeaturesProps {
  features: AgentPlanFeature[]
}

/** Lo que incluye un plan. */
const PlanFeatures = ({ features }: PlanFeaturesProps) => {
  return (
    <ul className="grid gap-2.5 text-sm">
      {features.map((feature) => (
        <li key={feature.text} className="flex items-start gap-2">
          <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
          {/* Un solo bloque: sueltos, la negrita y el resto serían piezas separadas de la fila. */}
          <span>
            <FeatureText {...feature} />
          </span>
        </li>
      ))}
    </ul>
  )
}

export default PlanFeatures
