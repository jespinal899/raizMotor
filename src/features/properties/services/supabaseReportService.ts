import { ReportThrottledError, ReportUnavailableError } from '@/features/properties/services/reportErrors'
import type { ReportService } from '@/features/properties/types/report.types'

/** Lo que recibe la función `report_property` de la base de datos (supabase/migrations). */
export interface ReportPropertyArgs {
  target_property: string
  report_reason: string
  report_details: string
  report_key: string
}

/** Llama a `report_property`. Lo que responde Supabase: el fallo, si lo hubo, nunca una excepción. */
export type CallReportProperty = (args: ReportPropertyArgs) => PromiseLike<{ error: { code?: string } | null }>

/** Código con el que la base de datos pide esperar: llegaron demasiados reportes en la última hora. */
const THROTTLED = 'RZ004'
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Reportes guardados en Supabase, donde los revisa el equipo. La clave del envío evita registrarlo dos veces. */
export const createSupabaseReportService = (callReportProperty: CallReportProperty): ReportService => ({
  report: async ({ propertyId, reason, details }, operationKey) => {
    // Las propiedades de ejemplo no son anuncios de nadie: no hay a quién revisar.
    if (!UUID.test(propertyId)) throw new ReportUnavailableError()

    const { error } = await callReportProperty({
      target_property: propertyId,
      report_reason: reason,
      report_details: details,
      report_key: operationKey,
    })

    if (error?.code === THROTTLED) throw new ReportThrottledError()
    if (error) throw error
  },
})
