import { describe, expect, it } from 'vitest'
import type { ContactFormValues } from '@/features/contact/types/contact.types'
import { hasErrors, validateContactForm } from '@/features/contact/utils/contactValidation'

const validValues = (overrides: Partial<ContactFormValues> = {}): ContactFormValues => ({
  name: 'Ana',
  email: 'ana@gmail.com',
  phone: '',
  description: 'Quiero publicar mi casa.',
  ...overrides,
})

describe('validateContactForm', () => {
  it('no encuentra errores en un formulario bien rellenado', () => {
    // Arrange
    const values = validValues()

    // Act
    const errors = validateContactForm(values)

    // Assert
    expect(hasErrors(errors)).toBe(false)
  })

  it('exige nombre, correo y descripción, pero no el teléfono', () => {
    // Arrange
    const values = validValues({ name: '', email: '', phone: '', description: '   ' })

    // Act
    const errors = validateContactForm(values)

    // Assert
    expect(errors).toEqual({
      name: 'Escribe tu nombre.',
      email: 'Escribe tu correo para poder responderte.',
      phone: undefined,
      description: 'Describe tu consulta.',
    })
  })

  it('acepta un teléfono cuando se indica y es válido', () => {
    // Arrange
    const values = validValues({ phone: '+504 8915-0271' })

    // Act
    const errors = validateContactForm(values)

    // Assert
    expect(errors.phone).toBeUndefined()
  })

  it('rechaza un teléfono mal escrito aunque sea opcional', () => {
    // Arrange
    const values = validValues({ phone: '12345' })

    // Act
    const errors = validateContactForm(values)

    // Assert
    expect(errors.phone).toBe('Escribe un teléfono válido, de 8 a 15 dígitos.')
    expect(hasErrors(errors)).toBe(true)
  })

  it('rechaza un correo mal escrito', () => {
    // Arrange
    const values = validValues({ email: 'ana@gmail' })

    // Act
    const errors = validateContactForm(values)

    // Assert
    expect(errors.email).toBe('Escribe un correo válido, por ejemplo nombre@gmail.com.')
  })

  it('rechaza un nombre de una sola letra', () => {
    // Arrange
    const values = validValues({ name: 'A' })

    // Act
    const errors = validateContactForm(values)

    // Assert
    expect(errors.name).toBe('El nombre debe tener al menos 2 letras.')
  })

  it('rechaza una descripción demasiado corta', () => {
    // Arrange
    const values = validValues({ description: 'Hola' })

    // Act
    const errors = validateContactForm(values)

    // Assert
    expect(errors.description).toBe('Cuéntanos un poco más: al menos 10 caracteres.')
  })
})
