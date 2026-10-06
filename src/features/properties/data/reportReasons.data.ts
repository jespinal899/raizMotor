import type { ReportReason } from '@/features/properties/types/report.types'

/** Motivos por los que se puede reportar una publicación, en el orden en que se ofrecen. */
export const REPORT_REASONS: Record<ReportReason, string> = {
  misleading: 'Información falsa o engañosa',
  fraud: 'Posible fraude o estafa',
  outdated: 'Ya no está disponible',
  inappropriate: 'Contenido inapropiado',
  other: 'Otro motivo',
}
