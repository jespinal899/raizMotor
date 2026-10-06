import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import ReportPropertyDialog from '@/features/properties/components/ReportPropertyDialog'
import { reportService } from '@/features/properties/services/reportService'
import { anyOperationKey } from '@/test/operationKey'
import { reportForm } from '@/test/reportForm'

/** Abre la ventana como lo haría una persona: con el botón de reportar. */
const openDialog = async () => {
  const user = userEvent.setup()
  render(<ReportPropertyDialog propertyId="casa-1" />)
  await user.click(screen.getByRole('button', { name: 'Reportar' }))

  return { user, dialog: await screen.findByRole('dialog', { name: 'Reportar publicación' }) }
}

describe('ReportPropertyDialog', () => {
  it('hasta que se pulsa "Reportar" no muestra la ventana', () => {
    // Arrange: ficha recién abierta

    // Act
    render(<ReportPropertyDialog propertyId="casa-1" />)

    // Assert
    expect(screen.getByRole('button', { name: 'Reportar' })).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('abre "Reportar publicación" con su explicación y el formulario', async () => {
    // Arrange: ficha recién abierta

    // Act
    const { dialog } = await openDialog()

    // Assert
    expect(dialog).toHaveAccessibleDescription('Cuéntanos qué pasa con este anuncio para que podamos revisarlo.')
    expect(within(dialog).getByRole('form', { name: 'Reporte de la publicación' })).toBeInTheDocument()
  })

  it('al enviar, reporta esta publicación con el motivo y el comentario', async () => {
    // Arrange
    const report = vi.spyOn(reportService, 'report').mockResolvedValue()
    const { user } = await openDialog()
    await user.click(reportForm.reason('Posible fraude o estafa'))
    await user.type(reportForm.details(), 'Piden un adelanto.')

    // Act
    await user.click(reportForm.submitButton())

    // Assert
    expect(report).toHaveBeenCalledExactlyOnceWith(
      { propertyId: 'casa-1', reason: 'fraud', details: 'Piden un adelanto.' },
      anyOperationKey(),
    )
    expect(await screen.findByRole('status')).toHaveTextContent('Recibimos tu reporte')
  })

  it('hoy, sin servidor, avisa de que el reporte no se envió', async () => {
    // Arrange
    const { user, dialog } = await openDialog()
    await user.click(reportForm.reason('Ya no está disponible'))

    // Act
    await user.click(reportForm.submitButton())

    // Assert
    const title = await within(dialog).findByText('Los reportes aún no están disponibles')
    expect(title.closest('[role="alert"]')).toHaveTextContent('No se envió tu reporte.')
  })

  it('al cerrarla y volver a abrirla empieza de nuevo, sin el motivo de antes', async () => {
    // Arrange
    const { user, dialog } = await openDialog()
    await user.click(reportForm.reason('Ya no está disponible'))
    await user.click(within(dialog).getByRole('button', { name: 'Cerrar' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())

    // Act
    await user.click(screen.getByRole('button', { name: 'Reportar' }))

    // Assert
    await screen.findByRole('dialog', { name: 'Reportar publicación' })
    expect(reportForm.reason('Ya no está disponible')).not.toBeChecked()
  })
})
