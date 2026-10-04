export type PlanId = 'particular' | 'inmobiliaria' | 'constructora'

export type PlanPrice =
  | { kind: 'free' }
  /** Precio mensual de partida, en USD. */
  | { kind: 'monthly'; from: number }
  /** Se acuerda con ventas según el caso. */
  | { kind: 'custom' }

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
