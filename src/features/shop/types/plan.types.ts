import type { LucideIcon } from 'lucide-react'

export interface PlanAction {
  label: string
  to: string
  /** Icono decorativo que acompaña el enlace cuando la tarjeta lo presenta. */
  icon?: LucideIcon
}

/** Lo que tiene cualquier plan que se muestra en una tarjeta: su nombre y su siguiente paso. */
export interface ListedPlan {
  id: string
  name: string
  action: PlanAction
}

export type PlanId = 'propietario' | 'agente' | 'inmobiliaria'

/** Una forma de publicar según quién anuncia: lo que se elige en la página de planes. */
export interface Plan extends ListedPlan {
  id: PlanId
  description: string
}

export type AgentPlanId = 'agente-plan-1' | 'agente-plan-2'

export interface AgentPlanFeature {
  text: string
  emphasized?: string
}

/** Un plan de pago para agentes inmobiliarios. */
export interface AgentPlan extends ListedPlan {
  id: AgentPlanId
  features: AgentPlanFeature[]
  /** En lempiras, sin el impuesto sobre ventas. */
  monthlyPrice: number
}
