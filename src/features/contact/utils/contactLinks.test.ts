import { describe, expect, it } from 'vitest'
import { buildEmailHref, buildPhoneHref } from '@/features/contact/utils/contactLinks'

describe('buildPhoneHref', () => {
  it('genera un enlace de llamada en formato internacional', () => {
    // Arrange
    const phone = '+504 8915-0271'

    // Act
    const href = buildPhoneHref(phone)

    // Assert
    expect(href).toBe('tel:+50489150271')
  })
})

describe('buildEmailHref', () => {
  it('genera un enlace para escribir al correo indicado', () => {
    // Arrange
    const email = ' contacto@ejemplo.com '

    // Act
    const href = buildEmailHref(email)

    // Assert
    expect(href).toBe('mailto:contacto@ejemplo.com')
  })
})
