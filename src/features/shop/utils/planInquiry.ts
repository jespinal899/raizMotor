import { AGENT_PLANS, PLANS } from '@/features/shop/data/plans.data'

/** Lo que necesita saber el contacto del plan por el que se consulta. */
export interface PlanInquiry {
  id: string
  name: string
  detail: string
}

const INQUIRIES: PlanInquiry[] = [
  ...PLANS.map(({ id, name, description }) => ({ id, name, detail: description })),
  ...AGENT_PLANS.map(({ id, name, features }) => ({
    id,
    name,
    detail: features.map(({ text }) => text).join(' · '),
  })),
]

/** El plan indicado en la URL del contacto, si existe. */
export const findPlanInquiry = (id: string | null) => INQUIRIES.find((plan) => plan.id === id)
