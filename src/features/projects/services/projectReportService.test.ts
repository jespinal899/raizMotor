import { beforeEach, describe, expect, it, vi } from 'vitest'

const rpc = vi.hoisted(() => vi.fn())

vi.mock('@/lib/supabaseClient', () => ({ supabase: { rpc } }))

const PROJECT_ID = '0b9f8c1e-6f3a-4c8e-9a51-2f1c3d4e5f60'

describe('projectReportService', () => {
  beforeEach(() => {
    rpc.mockReset()
    rpc.mockResolvedValue({ error: null })
  })

  it('envía el reporte a la función de proyectos, con el proyecto y la clave del envío', async () => {
    // Arrange
    const { projectReportService } = await import('@/features/projects/services/projectReportService')

    // Act
    await projectReportService.report({ propertyId: PROJECT_ID, reason: 'fraud', details: 'Piden la prima por adelantado' }, 'clave-1')

    // Assert
    expect(rpc).toHaveBeenCalledExactlyOnceWith('report_project', {
      target_project: PROJECT_ID,
      report_reason: 'fraud',
      report_details: 'Piden la prima por adelantado',
      report_key: 'clave-1',
    })
  })
})
