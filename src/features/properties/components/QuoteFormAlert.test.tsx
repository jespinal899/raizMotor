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

  it('cuando el contacto por correo aún no está activo lo dice y deja claro que no se envió nada', () => {
    // Arrange
    const status = 'unavailable'

    // Act
    render(<QuoteFormAlert status={status} />)

    // Assert
    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('El contacto por correo aún no está disponible')
    expect(alert).toHaveTextContent(`No se enviaron tus datos. Mientras tanto, llámanos al ${CONTACT.phone.display}.`)
  })

  it('si llegaron demasiados contactos, dice que no se enviaron los datos y cuándo reintentar', () => {
    // Arrange
    const status = 'throttled'

    // Act
    render(<QuoteFormAlert status={status} />)

    // Assert
    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('Ya se enviaron muchos contactos')
    expect(alert).toHaveTextContent('Inténtalo de nuevo en una hora.')
  })

  it('si no se pudo comprobar que no es un bot, pide marcar la casilla si aparece', () => {
    // Arrange
    const status = 'captcha'

    // Act
    render(<QuoteFormAlert status={status} />)

    // Assert
    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('No pudimos comprobar que no eres un robot')
    expect(alert).toHaveTextContent('Si aparece una casilla encima del botón, márcala.')
  })

  it('ante un fallo del envío invita a reintentar o a llamar', () => {
    // Arrange
    const status = 'failed'

    // Act
    render(<QuoteFormAlert status={status} />)

    // Assert
    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('No pudimos enviar tus datos')
    expect(alert).toHaveTextContent(`Inténtalo de nuevo o llámanos al ${CONTACT.phone.display}.`)
  })

  it('cuando la solicitud sale, lo confirma sin interrumpir', () => {
    // Arrange
    const status = 'sent'

    // Act
    render(<QuoteFormAlert status={status} />)

    // Assert
    const confirmation = screen.getByRole('status')
    expect(confirmation).toHaveTextContent('Le enviamos tus datos al publicador')
    expect(confirmation).toHaveTextContent('Te escribirá o te llamará directamente. Revisa también tu correo no deseado.')
  })
})
