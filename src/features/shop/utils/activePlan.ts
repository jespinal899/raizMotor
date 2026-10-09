import { MAX_FREE_PUBLICATIONS } from '@/features/properties/utils/publicationLimit'
import { AGENT_PLANS, PLANS } from '@/features/shop/data/plans.data'

export interface ActivePlan {
  name: string
  /** El plan Propietario, que no se paga. */
  isFree: boolean
}

const FREE_PLAN = PLANS.find((plan) => plan.id === 'propietario')!
/** Un límite que no es el de ningún plan en venta lo acordó el equipo con esa cuenta. */
const CUSTOM_PLAN = 'Plan a medida'

/**
 * El plan de una cuenta, deducido de cuántas publicaciones admite a la vez: ese límite es lo único que la
 * cuenta guarda de su plan.
 */
export const toActivePlan = (limit: number): ActivePlan => {
  if (limit === MAX_FREE_PUBLICATIONS) return { name: FREE_PLAN.name, isFree: true }

  return { name: AGENT_PLANS.find((plan) => plan.maxPublications === limit)?.name ?? CUSTOM_PLAN, isFree: false }
}
