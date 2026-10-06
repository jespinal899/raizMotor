import type { PropertyReport } from '@/features/properties/types/report.types'

/** Los reportes no están conectados todavía; no es un fallo de red ni de quien reporta. */
export class ReportUnavailableError extends Error {
  constructor() {
    super('El envío de reportes aún no está configurado.')
    this.name = 'ReportUnavailableError'
  }
}

export interface ReportService {
  /**
   * Se resuelve cuando el reporte queda entregado y se rechaza si no se pudo enviar. Es idempotente: si
   * llega dos veces con la misma clave, por un reintento o un doble envío, se registra una sola vez.
   */
  report(report: PropertyReport, operationKey: string): Promise<void>
}

/** Implementación provisional mientras no exista el servidor: nunca finge que el reporte salió. */
export const createPendingReportService = (): ReportService => ({
  report: async () => {
    throw new ReportUnavailableError()
  },
})

// Único punto donde se elige cómo se envían los reportes: al conectar el servidor, se cambia solo esta línea.
export const reportService: ReportService = createPendingReportService()
