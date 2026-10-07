import type { ContactTopic } from '@/features/contact/types/contact.types'
import type { Property } from '@/features/properties/types/property.types'
import type { PlanInquiry } from '@/features/shop/utils/planInquiry'

export const buildPropertyTopic = (property: Property, reference: string): ContactTopic => ({
  id: `propiedad:${property.id}`,
  label: 'Consulta sobre la propiedad',
  title: property.title,
  detail: `${property.district}, ${property.city}`,
  defaultDescription: `Me interesa la propiedad "${property.title}" en ${property.district}, ${property.city}. ¿Sigue disponible?`,
  reference,
})

export const buildPlanTopic = (plan: PlanInquiry): ContactTopic => ({
  id: `plan:${plan.id}`,
  label: 'Consulta sobre el plan',
  title: plan.name,
  detail: plan.detail,
  defaultDescription: `Me interesa el plan ${plan.name}. ¿Me pueden dar más información?`,
})
