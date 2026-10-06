import type { FieldErrors } from '@/shared/utils/validators'

/** Por qué se reporta una publicación. */
export type ReportReason = 'misleading' | 'fraud' | 'outdated' | 'inappropriate' | 'other'

/** Lo que se elige y se escribe en la ventana de reporte. */
export interface ReportFormValues {
  /** Cadena vacía cuando aún no se eligió ninguno. */
  reason: ReportReason | ''
  /** Opcional, salvo con "Otro motivo": ahí es lo único que dice qué pasa. */
  details: string
}

export type ReportFormErrors = FieldErrors<ReportFormValues>

/** El reporte ya listo para enviar. */
export interface ReportDetails {
  reason: ReportReason
  details: string
}

export interface PropertyReport extends ReportDetails {
  /** La publicación que se reporta. */
  propertyId: string
}

/** Por qué no salió el reporte: `unavailable` significa que los reportes aún no están activos. */
export type ReportFailure = 'unavailable' | 'failed'

export type ReportFormStatus = 'idle' | 'sending' | 'sent' | ReportFailure
