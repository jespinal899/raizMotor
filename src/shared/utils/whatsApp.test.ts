import { describe, expect, it } from 'vitest'
import { whatsAppUrl } from '@/shared/utils/whatsApp'

describe('whatsAppUrl', () => {
  it('con un número, abre el chat con él y deja el texto ya escrito', () => {
    // Arrange
    const text = 'Hola, quiero contratar el plan Agente Pro.\nTotal al mes: L 688.85'

    // Act
    const url = new URL(whatsAppUrl(text, '+50489150271'))

    // Assert
    expect(`${url.origin}${url.pathname}`).toBe('https://wa.me/50489150271')
    expect(url.searchParams.get('text')).toBe(text)
  })

  it('sin número, deja que quien la abre elija a quién enviarlo', () => {
    // Arrange
    const text = 'Casa en venta · $ 285,000'

    // Act
    const url = new URL(whatsAppUrl(text))

    // Assert
    expect(`${url.origin}${url.pathname}`).toBe('https://wa.me/')
    expect(url.searchParams.get('text')).toBe(text)
  })

  it('codifica el texto para que sus signos no rompan la dirección', () => {
    // Arrange
    const text = '¿Precio & forma de pago? #1'

    // Act
    const url = whatsAppUrl(text, '+50489150271')

    // Assert
    expect(url).not.toContain(' ')
    expect(url).not.toContain('#')
    expect(new URL(url).searchParams.get('text')).toBe(text)
  })
})
