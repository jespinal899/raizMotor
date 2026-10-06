import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useReportForm } from '@/features/properties/hooks/useReportForm'
import { ReportUnavailableError } from '@/features/properties/services/reportService'
import type { ReportDetails } from '@/features/properties/types/report.types'
import { deferred } from '@/test/deferred'
import { anyOperationKey } from '@/test/operationKey'

type Submit = (report: ReportDetails, operationKey: string) => Promise<void>

const setup = (onSubmit: Submit = vi.fn(async () => {})) => {
  const view = renderHook(() => useReportForm({ onSubmit }))
  return { onSubmit, ...view }
}

const chooseReason = (result: ReturnType<typeof setup>['result']) => {
  act(() => result.current.change('reason', 'fraud'))
}

describe('useReportForm', () => {
  it('empieza sin motivo, sin comentario, sin errores y sin haber enviado', () => {
    // Arrange: ventana recién abierta

    // Act
    const { result } = setup()

    // Assert
    expect(result.current.values).toEqual({ reason: '', details: '' })
    expect(result.current.errors).toEqual({})
    expect(result.current.status).toBe('idle')
  })

  it('no envía y lo pide si no se eligió un motivo', async () => {
    // Arrange
    const { result, onSubmit } = setup()

    // Act
    await act(() => result.current.submit())

    // Assert
    expect(onSubmit).not.toHaveBeenCalled()
    expect(result.current.errors.reason).toBe('Elige un motivo.')
    expect(result.current.status).toBe('idle')
  })

  it('envía el motivo y el comentario sin espacios sobrantes, y queda como enviado', async () => {
    // Arrange
    const { result, onSubmit } = setup()
    chooseReason(result)
    act(() => result.current.change('details', '  Piden un adelanto.  '))

    // Act
    await act(() => result.current.submit())

    // Assert
    expect(onSubmit).toHaveBeenCalledExactlyOnceWith({ reason: 'fraud', details: 'Piden un adelanto.' }, anyOperationKey())
    expect(result.current.status).toBe('sent')
  })

  it('mientras el envío está en curso lo indica', async () => {
    // Arrange
    const sending = deferred()
    const { result } = setup(vi.fn(() => sending.promise))
    chooseReason(result)

    // Act
    let submission = Promise.resolve()
    act(() => {
      submission = result.current.submit()
    })

    // Assert
    expect(result.current.status).toBe('sending')
    sending.finish()
    await act(() => submission)
  })

  it('cuando los reportes aún no están activos lo distingue de un fallo', async () => {
    // Arrange
    const { result } = setup(vi.fn(() => Promise.reject(new ReportUnavailableError())))
    chooseReason(result)

    // Act
    await act(() => result.current.submit())

    // Assert
    expect(result.current.status).toBe('unavailable')
  })

  it('cualquier otro rechazo es un fallo del envío', async () => {
    // Arrange
    const { result } = setup(vi.fn(() => Promise.reject(new Error('sin conexión'))))
    chooseReason(result)

    // Act
    await act(() => result.current.submit())

    // Assert
    expect(result.current.status).toBe('failed')
  })

  it('enviarlo dos veces seguidas lo reporta una sola vez', async () => {
    // Arrange
    const sending = deferred()
    const { result, onSubmit } = setup(vi.fn(() => sending.promise))
    chooseReason(result)

    // Act
    let submissions: Promise<void>[] = []
    act(() => {
      submissions = [result.current.submit(), result.current.submit()]
    })
    sending.finish()
    await act(() => Promise.all(submissions).then(() => {}))

    // Assert
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('ya enviado, repetirlo sin cambiar nada no vuelve a enviarlo', async () => {
    // Arrange
    const { result, onSubmit } = setup()
    chooseReason(result)
    await act(() => result.current.submit())

    // Act
    await act(() => result.current.submit())

    // Assert
    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(result.current.status).toBe('sent')
  })
})
