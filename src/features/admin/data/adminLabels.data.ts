import type { AdminProjectStatus, ListingStatus, ReportStatus } from '@/features/admin/types/admin.types'
import { MAX_FREE_PUBLICATIONS } from '@/features/properties/utils/publicationLimit'
import { PAID_PLANS } from '@/features/shop/data/plans.data'

export const LISTING_STATUS_LABELS: Record<ListingStatus, string> = {
  published: 'Publicado',
  unpublished: 'Despublicado por su dueño',
  hidden: 'Oculto por el equipo',
}

export const PROJECT_STATUS_LABELS: Record<AdminProjectStatus, string> = {
  published: 'Publicado',
  draft: 'En borrador de la inmobiliaria',
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
export const PLAN_LIMITS: { label: string; publications: number; projects: number }[] = [
  { label: 'Propietario', publications: MAX_FREE_PUBLICATIONS, projects: 0 },
  ...PAID_PLANS.map(({ name, maxPublications, maxProjects }) => ({
    label: name,
    publications: maxPublications,
    projects: maxProjects,
  })),
]
