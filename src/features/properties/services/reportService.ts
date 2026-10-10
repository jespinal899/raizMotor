import { ReportUnavailableError } from '@/features/properties/services/reportErrors'
import { createSupabaseReportService } from '@/features/properties/services/supabaseReportService'
import type { ReportService } from '@/features/properties/types/report.types'
import { supabase } from '@/lib/supabaseClient'

export { ReportThrottledError, ReportUnavailableError } from '@/features/properties/services/reportErrors'
export type { ReportService } from '@/features/properties/types/report.types'

/** Implementación provisional mientras no exista el servidor: nunca finge que el reporte salió. */
export const createPendingReportService = (): ReportService => ({
  report: async () => {
    throw new ReportUnavailableError()
  },
})

// Único punto donde se elige cómo se envían los reportes: con Supabase llegan al equipo; sin él, se avisa.
const client = supabase

export const reportService: ReportService = client
  ? createSupabaseReportService((args) => client.rpc('report_property', args))
  : createPendingReportService()
