import type { ListingStatus, ReportStatus } from '@/features/admin/types/admin.types'
import { MAX_FREE_PUBLICATIONS } from '@/features/properties/utils/publicationLimit'
import { AGENT_PLANS } from '@/features/shop/data/plans.data'

export const LISTING_STATUS_LABELS: Record<ListingStatus, string> = {
  published: 'Publicado',
  unpublished: 'Despublicado por su dueño',
  hidden: 'Oculto por el equipo',
}

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  open: 'Pendientes',
  resolved: 'Resueltos',
  dismissed: 'Descartados',
}

/**
 * Los límites de los planes en venta, para elegirlos sin escribirlos. Salen de donde se definen los planes:
 * el panel no puede dar a un plan otro número que el que la tarjeta promete.
 */
export const PLAN_LIMITS: { label: string; limit: number }[] = [
  { label: 'Propietario', limit: MAX_FREE_PUBLICATIONS },
  ...AGENT_PLANS.map(({ name, maxPublications }) => ({ label: name, limit: maxPublications })),
]
