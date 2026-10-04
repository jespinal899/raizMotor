import { describe, expect, it } from 'vitest'
import { CONTACT } from '@/shared/constants/contact'

describe('CONTACT', () => {
  it('el teléfono para enlaces coincide con el que se muestra', () => {
    // Arrange
    const digitsOf = (phone: string) => phone.replace(/\D/g, '')

    // Act
    const shown = digitsOf(CONTACT.phone.display)
    const linked = digitsOf(CONTACT.phone.e164)

    // Assert
    expect(linked).toBe(shown)
  })

  it('el teléfono para enlaces está en formato internacional, sin espacios ni guiones', () => {
    // Arrange
    const internationalFormat = /^\+\d{8,15}$/

    // Act
    const phone = CONTACT.phone.e164

    // Assert
    expect(phone).toMatch(internationalFormat)
  })

  it('el correo, si está configurado, tiene formato de dirección', () => {
    // Arrange
    const addressFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    // Act
    const isPendingOrValid = CONTACT.email === undefined || addressFormat.test(CONTACT.email)

    // Assert
    expect(isPendingOrValid).toBe(true)
  })

  it('las redes con cuenta creada tienen una dirección segura', () => {
    // Arrange
    const withAccount = CONTACT.social.filter(({ url }) => url !== undefined)

    // Act
    const insecure = withAccount.filter(({ url }) => !url?.startsWith('https://'))

    // Assert
    expect(insecure).toEqual([])
  })
})
