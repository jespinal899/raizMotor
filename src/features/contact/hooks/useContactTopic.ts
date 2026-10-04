import { useHref, useSearchParams } from 'react-router-dom'
import type { ContactTopic } from '@/features/contact/types/contact.types'
import { buildPlanTopic, buildPropertyTopic } from '@/features/contact/utils/contactTopic'
import { propertyService } from '@/features/properties/services/propertyService'
import type { PropertyService } from '@/features/properties/services/propertyService'
import { PLANS } from '@/features/shop/data/plans.data'
import { useAsyncData } from '@/hooks/useAsyncData'
import { CONTACT_PARAMS, propertyDetailPath } from '@/shared/constants/routes'

/** Averigua, a partir de la URL, si la consulta es sobre una propiedad o un plan concretos. */
export const useContactTopic = (service: PropertyService = propertyService) => {
  const [searchParams] = useSearchParams()
  const propertyId = searchParams.get(CONTACT_PARAMS.property) ?? ''
  const planId = searchParams.get(CONTACT_PARAMS.plan)

  // useHref añade el prefijo de publicación; con el origen queda un enlace que se puede abrir desde fuera.
  const propertyHref = useHref(propertyDetailPath(propertyId))
  const { data: property, isLoading } = useAsyncData(
    async () => (propertyId ? service.getById(propertyId) : undefined),
    `contact-property:${propertyId}`,
  )

  const plan = PLANS.find(({ id }) => id === planId)
  let topic: ContactTopic | undefined
  if (property) topic = buildPropertyTopic(property, new URL(propertyHref, window.location.origin).href)
  else if (plan) topic = buildPlanTopic(plan)

  return { topic, isLoading: Boolean(propertyId) && isLoading }
}
