import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import QuoteFormAlert from '@/features/properties/components/QuoteFormAlert'
import { CONTACT } from '@/shared/constants/contact'

describe('QuoteFormAlert', () => {
  it.each(['idle', 'sending'] as const)('no muestra nada en el estado "%s"', (status) => {
    // Arrange: todavía no hay resultado

    // Act
    const { container } = render(<QuoteFormAlert status={status} />)

    // Assert
    expect(container).toBeEmptyDOMElement()
  })

  it('cuando las cotizaciones aún no están activas lo dice y deja claro que no se envió nada', () => {
    // Arrange
    const status = 'unavailable'

    // Act
    render(<QuoteFormAlert status={status} />)

    // Assert
    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('Las cotizaciones aún no están disponibles')
    expect(alert).toHaveTextContent(`No se envió tu solicitud. Mientras tanto, llámanos al ${CONTACT.phone.display}.`)
  })

  it('ante un fallo del envío invita a reintentar o a llamar', () => {
    // Arrange
    const status = 'failed'

    // Act
    render(<QuoteFormAlert status={status} />)

    // Assert
    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('No pudimos enviar tu solicitud')
    expect(alert).toHaveTextContent(`Inténtalo de nuevo o llámanos al ${CONTACT.phone.display}.`)
  })

  it('cuando la solicitud sale, lo confirma sin interrumpir', () => {
    // Arrange
    const status = 'sent'

    // Act
    render(<QuoteFormAlert status={status} />)

    // Assert
    const confirmation = screen.getByRole('status')
    expect(confirmation).toHaveTextContent('Recibimos tu solicitud')
    expect(confirmation).toHaveTextContent('Te contactaremos pronto con la cotización de esta propiedad.')
  })
})
