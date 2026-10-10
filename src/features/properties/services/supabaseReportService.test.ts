import { describe, expect, it, vi } from 'vitest'
import { ReportThrottledError, ReportUnavailableError } from '@/features/properties/services/reportErrors'
import { createSupabaseReportService } from '@/features/properties/services/supabaseReportService'
import type { CallReportProperty } from '@/features/properties/services/supabaseReportService'

const PROPERTY_ID = '3f0c2a54-6f0e-4a35-9b6f-0d6f1f6c2a11'
const REPORT = { propertyId: PROPERTY_ID, reason: 'fraud' as const, details: 'Pide un depósito por adelantado.' }

const answering = (error: { code?: string } | null = null) => vi.fn<CallReportProperty>(async () => ({ error }))

describe('createSupabaseReportService', () => {
  it('envía el reporte a la base de datos con la clave del envío', async () => {
    // Arrange
    const call = answering()

    // Act
    await createSupabaseReportService(call).report(REPORT, 'clave-del-envio')

    // Assert
    expect(call).toHaveBeenCalledExactlyOnceWith({
      target_property: PROPERTY_ID,
      report_reason: 'fraud',
      report_details: 'Pide un depósito por adelantado.',
      report_key: 'clave-del-envio',
    })
  })

  it('si llegaron demasiados reportes, rechaza con ReportThrottledError', async () => {
    // Arrange
    const call = answering({ code: 'RZ004' })

    // Act
    const sent = createSupabaseReportService(call).report(REPORT, 'clave')

    // Assert
    await expect(sent).rejects.toBeInstanceOf(ReportThrottledError)
  })

  it('cualquier otro fallo se entrega tal cual, sin dar el reporte por enviado', async () => {
    // Arrange
    const failure = { code: 'RZ003' }
    const call = answering(failure)

    // Act
    const sent = createSupabaseReportService(call).report(REPORT, 'clave')

    // Assert
    await expect(sent).rejects.toBe(failure)
  })

  it('una propiedad de ejemplo no se reporta: no es un anuncio de nadie', async () => {
    // Arrange
    const call = answering()

    // Act
    const sent = createSupabaseReportService(call).report({ ...REPORT, propertyId: 'casa-lomas-del-guijarro' }, 'clave')

    // Assert
    await expect(sent).rejects.toBeInstanceOf(ReportUnavailableError)
    expect(call).not.toHaveBeenCalled()
  })
})
