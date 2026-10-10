import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import ReportFormAlert from '@/features/properties/components/ReportFormAlert'
import { CONTACT } from '@/shared/constants/contact'

describe('ReportFormAlert', () => {
  it.each(['idle', 'sending'] as const)('no muestra nada en el estado "%s"', (status) => {
    // Arrange: todavía no hay resultado

    // Act
    const { container } = render(<ReportFormAlert status={status} />)

    // Assert
    expect(container).toBeEmptyDOMElement()
  })

  it('cuando los reportes aún no están activos lo dice y deja claro que no se envió nada', () => {
    // Arrange
    const status = 'unavailable'

    // Act
    render(<ReportFormAlert status={status} />)

    // Assert
    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('Los reportes aún no están disponibles')
    expect(alert).toHaveTextContent(`No se envió tu reporte. Mientras tanto, llámanos al ${CONTACT.phone.display}.`)
  })

  it('si llegaron demasiados reportes, dice que no se envió el suyo y cuándo reintentar', () => {
    // Arrange
    const status = 'throttled'

    // Act
    render(<ReportFormAlert status={status} />)

    // Assert
    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('Ya recibimos muchos reportes')
    expect(alert).toHaveTextContent('No se envió el tuyo')
    expect(alert).toHaveTextContent('Inténtalo de nuevo en una hora.')
  })

  it('ante un fallo del envío invita a reintentar o a llamar', () => {
    // Arrange
    const status = 'failed'

    // Act
    render(<ReportFormAlert status={status} />)

    // Assert
    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('No pudimos enviar tu reporte')
    expect(alert).toHaveTextContent(`Inténtalo de nuevo o llámanos al ${CONTACT.phone.display}.`)
  })

  it('cuando el reporte sale, lo confirma sin interrumpir', () => {
    // Arrange
    const status = 'sent'

    // Act
    render(<ReportFormAlert status={status} />)

    // Assert
    const confirmation = screen.getByRole('status')
    expect(confirmation).toHaveTextContent('Recibimos tu reporte')
    expect(confirmation).toHaveTextContent('Gracias por avisarnos. Revisaremos esta publicación.')
  })
})
