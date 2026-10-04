import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import ContactFormStatus from '@/features/contact/components/ContactFormStatus'
import { CONTACT } from '@/shared/constants/contact'

describe('ContactFormStatus', () => {
  it.each(['idle', 'sending'] as const)('no muestra nada en el estado "%s"', (status) => {
    // Arrange: estado sin resultado todavía

    // Act
    const { container } = render(<ContactFormStatus status={status} />)

    // Assert
    expect(container).toBeEmptyDOMElement()
  })

  it('confirma la recepción solo cuando el mensaje se envió', () => {
    // Arrange
    const status = 'sent'

    // Act
    render(<ContactFormStatus status={status} />)

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent('Recibimos tu mensaje. Te responderemos pronto.')
  })

  it('cuando el correo aún no está activo lo dice y ofrece el teléfono, sin hablar de envío', () => {
    // Arrange
    const status = 'unavailable'

    // Act
    render(<ContactFormStatus status={status} />)

    // Assert
    const message = screen.getByRole('status')
    expect(message).toHaveTextContent(
      `El envío por correo aún no está activo. Mientras tanto, llámanos al ${CONTACT.phone.display}.`,
    )
    expect(message).not.toHaveTextContent('Recibimos')
  })

  it('avisa del fallo como alerta y ofrece el teléfono', () => {
    // Arrange
    const status = 'failed'

    // Act
    render(<ContactFormStatus status={status} />)

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent(
      `No pudimos enviar tu mensaje. Inténtalo de nuevo o llámanos al ${CONTACT.phone.display}.`,
    )
  })
})
