import { createPendingReportService } from '@/features/properties/services/reportService'
import { createSupabaseReportService } from '@/features/properties/services/supabaseReportService'
import type { ReportService } from '@/features/properties/types/report.types'
import { supabase } from '@/lib/supabaseClient'

const client = supabase

/**
 * Los reportes de proyectos: los mismos motivos y las mismas reglas que los de anuncios, y llegan a la misma
 * lista del panel. La función `report_project` la crea supabase/migrations/20261018000000_moderar_proyectos.sql.
 * El identificador del proyecto viaja donde el servicio de reportes pone el del anuncio.
 */
export const projectReportService: ReportService = client
  ? createSupabaseReportService(({ target_property, ...report }) =>
      client.rpc('report_project', { target_project: target_property, ...report }),
    )
  : createPendingReportService()
