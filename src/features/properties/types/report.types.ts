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

/** Quien recibe los reportes. */
export interface ReportService {
  /**
   * Se resuelve cuando el reporte queda entregado y se rechaza si no se pudo enviar. Es idempotente: si
   * llega dos veces con la misma clave, por un reintento o un doble envío, se registra una sola vez.
   */
  report(report: PropertyReport, operationKey: string): Promise<void>
}

/**
 * Por qué no salió el reporte: `unavailable` significa que los reportes aún no están activos, y `throttled`,
 * que llegaron demasiados en poco tiempo y hay que esperar.
 */
export type ReportFailure = 'unavailable' | 'throttled' | 'failed'

export type ReportFormStatus = 'idle' | 'sending' | 'sent' | ReportFailure
