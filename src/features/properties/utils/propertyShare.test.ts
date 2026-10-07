import { describe, expect, it } from 'vitest'
import { buildShareText, buildWhatsAppShareUrl } from '@/features/properties/utils/propertyShare'
import { formatPriceInLempiras } from '@/shared/utils/format'
import { buildProperty } from '@/test/factories'

const URL_TO_SHARE = 'https://ejemplo.hn/propiedad/casa-1'
const inLempiras = (dollars: number) => formatPriceInLempiras(dollars).replace(/\s+/g, ' ')

describe('buildShareText', () => {
  it('resume la propiedad con su título, su precio en dólares y en lempiras, y su ubicación', () => {
    // Arrange
    const property = buildProperty({
      title: 'Casa amplia con patio',
      operation: 'venta',
      price: 145000,
      district: 'Colonia Trejo',
      city: 'San Pedro Sula',
    })

    // Act
    const text = buildShareText(property)

    // Assert
    expect(text.replace(/\s+/g, ' ')).toBe(
      `Casa amplia con patio · $ 145,000 (≈ ${inLempiras(145000)}) · Colonia Trejo, San Pedro Sula`,
    )
  })

  it('aclara que el precio es mensual cuando la propiedad se alquila', () => {
    // Arrange
    const property = buildProperty({ operation: 'alquiler', price: 850 })

    // Act
    const text = buildShareText(property)

    // Assert
    expect(text.replace(/\s+/g, ' ')).toContain(`$ 850 (≈ ${inLempiras(850)}) al mes`)
  })
})

describe('buildWhatsAppShareUrl', () => {
  it('abre WhatsApp con el resumen y el enlace ya escritos, sin elegir destinatario', () => {
    // Arrange
    const text = 'Casa amplia con patio · $ 145,000 · Colonia Trejo, San Pedro Sula'

    // Act
    const url = new URL(buildWhatsAppShareUrl(text, URL_TO_SHARE))

    // Assert
    expect(url.origin + url.pathname).toBe('https://wa.me/')
    expect(url.searchParams.get('text')).toBe(`${text}\n${URL_TO_SHARE}`)
  })

  it('codifica los caracteres especiales para que el mensaje llegue entero', () => {
    // Arrange
    const text = 'Casa & jardín, ¿la viste? #1'

    // Act
    const url = buildWhatsAppShareUrl(text, URL_TO_SHARE)

    // Assert
    expect(url).not.toContain(' ')
    expect(url).not.toContain('#1')
    expect(new URL(url).searchParams.get('text')).toContain(text)
  })
})
