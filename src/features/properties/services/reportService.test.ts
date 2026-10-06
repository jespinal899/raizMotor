import { describe, expect, it } from 'vitest'
import {
  ReportUnavailableError,
  createPendingReportService,
  reportService,
} from '@/features/properties/services/reportService'
import type { PropertyReport } from '@/features/properties/types/report.types'
import { TEST_OPERATION_KEY } from '@/test/operationKey'

const REPORT: PropertyReport = { propertyId: 'casa-1', reason: 'fraud', details: 'Piden un adelanto por transferencia.' }

describe('createPendingReportService', () => {
  it('rechaza el reporte indicando que aún no está activo, en lugar de fingir que se envió', async () => {
    // Arrange
    const service = createPendingReportService()

    // Act
    const reporting = service.report(REPORT, TEST_OPERATION_KEY)

    // Assert
    await expect(reporting).rejects.toBeInstanceOf(ReportUnavailableError)
  })
})

describe('ReportUnavailableError', () => {
  it('es un Error con nombre propio, para distinguirlo de un fallo de red', () => {
    // Arrange: no necesita datos

    // Act
    const error = new ReportUnavailableError()

    // Assert
    expect(error).toBeInstanceOf(Error)
    expect(error.name).toBe('ReportUnavailableError')
  })
})

describe('reportService', () => {
  it('mientras no haya servidor, el servicio de la aplicación no entrega reportes', async () => {
    // Arrange
    const service = reportService

    // Act
    const reporting = service.report(REPORT, TEST_OPERATION_KEY)

    // Assert
    await expect(reporting).rejects.toBeInstanceOf(ReportUnavailableError)
  })
})
