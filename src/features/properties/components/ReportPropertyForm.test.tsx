import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import ReportPropertyForm from '@/features/properties/components/ReportPropertyForm'
import { ReportUnavailableError } from '@/features/properties/services/reportService'
import { deferred } from '@/test/deferred'
import { anyOperationKey } from '@/test/operationKey'
import { reportForm } from '@/test/reportForm'

const sent = () => vi.fn(async () => {})

describe('ReportPropertyForm', () => {
  it('ofrece los motivos, sin ninguno elegido, y un comentario opcional', () => {
    // Arrange
    const onSubmit = sent()

    // Act
    render(<ReportPropertyForm onSubmit={onSubmit} />)

    // Assert
    const reasons = within(reportForm.reasons()).getAllByRole('radio')
    expect(reasons.map((reason) => reason.closest('label')?.textContent)).toEqual([
      'Información falsa o engañosa',
      'Posible fraude o estafa',
      'Ya no está disponible',
      'Contenido inapropiado',
      'Otro motivo',
    ])
    expect(reasons.every((reason) => reason.getAttribute('aria-checked') === 'false')).toBe(true)
    expect(reportForm.details()).toHaveAccessibleName('Cuéntanos más (opcional)')
    expect(reportForm.submitButton()).toHaveTextContent('Enviar reporte')
  })

  it('sin elegir un motivo no envía y lo pide', async () => {
    // Arrange
    const user = userEvent.setup()
    const onSubmit = sent()
    render(<ReportPropertyForm onSubmit={onSubmit} />)

    // Act
    await user.click(reportForm.submitButton())

    // Assert
    expect(onSubmit).not.toHaveBeenCalled()
    expect(reportForm.reasons()).toHaveAccessibleDescription('Elige un motivo.')
  })

  it('envía el motivo elegido y el comentario', async () => {
    // Arrange
    const user = userEvent.setup()
    const onSubmit = sent()
    render(<ReportPropertyForm onSubmit={onSubmit} />)
    await user.click(reportForm.reason('Posible fraude o estafa'))
    await user.type(reportForm.details(), 'Piden un adelanto.')

    // Act
    await user.click(reportForm.submitButton())

    // Assert
    expect(onSubmit).toHaveBeenCalledExactlyOnceWith({ reason: 'fraud', details: 'Piden un adelanto.' }, anyOperationKey())
  })

  it('con "Otro motivo" el comentario deja de ser opcional', async () => {
    // Arrange
    const user = userEvent.setup()
    const onSubmit = sent()
    render(<ReportPropertyForm onSubmit={onSubmit} />)
    await user.click(reportForm.reason('Otro motivo'))

    // Act
    await user.click(reportForm.submitButton())

    // Assert
    expect(onSubmit).not.toHaveBeenCalled()
    expect(reportForm.details()).toHaveAccessibleName('Cuéntanos más')
    expect(reportForm.details()).toHaveAccessibleDescription('Cuéntanos cuál es el motivo.')
  })

  it('mientras envía, el botón lo indica y no deja repetirlo', async () => {
    // Arrange
    const user = userEvent.setup()
    const sending = deferred()
    render(<ReportPropertyForm onSubmit={vi.fn(() => sending.promise)} />)
    await user.click(reportForm.reason('Ya no está disponible'))

    // Act
    await user.click(reportForm.submitButton())

    // Assert
    expect(reportForm.submitButton()).toHaveTextContent('Enviando…')
    expect(reportForm.submitButton()).toBeDisabled()
    sending.finish()
    expect(await screen.findByRole('status')).toBeInTheDocument()
  })

  it('cuando los reportes aún no están activos lo dice, sin fingir que se envió', async () => {
    // Arrange
    const user = userEvent.setup()
    render(<ReportPropertyForm onSubmit={vi.fn(() => Promise.reject(new ReportUnavailableError()))} />)
    await user.click(reportForm.reason('Contenido inapropiado'))

    // Act
    await user.click(reportForm.submitButton())

    // Assert
    const title = await within(reportForm.form()).findByText('Los reportes aún no están disponibles')
    expect(title.closest('[role="alert"]')).toHaveTextContent('No se envió tu reporte.')
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(reportForm.submitButton()).toBeEnabled()
  })

  it('ante un fallo del envío lo avisa y deja reintentar', async () => {
    // Arrange
    const user = userEvent.setup()
    render(<ReportPropertyForm onSubmit={vi.fn(() => Promise.reject(new Error('sin conexión')))} />)
    await user.click(reportForm.reason('Contenido inapropiado'))

    // Act
    await user.click(reportForm.submitButton())

    // Assert
    expect(await within(reportForm.form()).findByText('No pudimos enviar tu reporte')).toBeInTheDocument()
    expect(reportForm.submitButton()).toBeEnabled()
  })

  it('ya enviado, lo confirma y desactiva el botón: repetirlo no enviaría nada', async () => {
    // Arrange
    const user = userEvent.setup()
    render(<ReportPropertyForm onSubmit={sent()} />)
    await user.click(reportForm.reason('Información falsa o engañosa'))

    // Act
    await user.click(reportForm.submitButton())

    // Assert
    expect(await screen.findByRole('status')).toHaveTextContent('Recibimos tu reporte')
    expect(reportForm.submitButton()).toBeDisabled()
  })
})
