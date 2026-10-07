export type PlanId = 'propietario' | 'agente' | 'inmobiliaria'

export type PlanPrice =
  | { kind: 'free' }
  /** Precio mensual de partida, en USD. */
  | { kind: 'monthly'; from: number }
  /** Plan anunciado cuyo precio y contenido aún no están definidos. */
  | { kind: 'upcoming' }

export interface PlanAction {
  label: string
  to: string
}

export interface Plan {
  id: PlanId
  name: string
  audience: string
  price: PlanPrice
  features: string[]
  action: PlanAction
  /** Plan que se destaca visualmente como recomendado. */
  highlighted?: boolean
}
