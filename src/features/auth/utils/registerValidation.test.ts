import { describe, expect, it } from 'vitest'
import { MIN_PASSWORD_LENGTH } from '@/features/auth/utils/credentialRules'
import { MAX_NAME_LENGTH, validateRegistration } from '@/features/auth/utils/registerValidation'
import { hasErrors } from '@/shared/utils/validators'
import { buildRegistration } from '@/test/factories'

describe('validateRegistration', () => {
  it('no encuentra errores cuando todos los datos están bien escritos', () => {
    // Arrange
    const registration = buildRegistration()

    // Act
    const errors = validateRegistration(registration)

    // Assert
    expect(hasErrors(errors)).toBe(false)
  })

  it('exige el nombre, el apellido, el correo, el teléfono y la contraseña', () => {
    // Arrange
    const registration = buildRegistration({ firstName: ' ', lastName: '', email: '', phone: '  ', password: '' })

    // Act
    const errors = validateRegistration(registration)

    // Assert
    expect(errors).toEqual({
      firstName: 'Escribe tu nombre.',
      lastName: 'Escribe tu apellido.',
      email: 'Escribe tu correo.',
      phone: 'Escribe tu teléfono.',
      password: 'Escribe tu contraseña.',
    })
  })

  it('rechaza un correo mal escrito, con el mismo aviso que al iniciar sesión', () => {
    // Arrange
    const registration = buildRegistration({ email: 'ana@gmail' })

    // Act
    const errors = validateRegistration(registration)

    // Assert
    expect(errors.email).toBe('Revisa el correo: debe tener el formato nombre@dominio.com.')
  })

  it('acepta un nombre y un apellido que llegan justo al máximo de caracteres', () => {
    // Arrange
    const longest = 'a'.repeat(MAX_NAME_LENGTH)
    const registration = buildRegistration({ firstName: longest, lastName: longest })

    // Act
    const errors = validateRegistration(registration)

    // Assert
    expect(hasErrors(errors)).toBe(false)
  })

  it('rechaza un nombre y un apellido que pasan del máximo de caracteres', () => {
    // Arrange
    const tooLong = 'a'.repeat(MAX_NAME_LENGTH + 1)
    const registration = buildRegistration({ firstName: tooLong, lastName: tooLong })

    // Act
    const errors = validateRegistration(registration)

    // Assert
    expect(errors.firstName).toBe(`El nombre no puede pasar de ${MAX_NAME_LENGTH} caracteres.`)
    expect(errors.lastName).toBe(`El apellido no puede pasar de ${MAX_NAME_LENGTH} caracteres.`)
  })

  it.each(['9999-8888', '2234-5678', '+504 8915-0271'])('acepta el teléfono de Honduras "%s"', (phone) => {
    // Arrange
    const registration = buildRegistration({ phone })

    // Act
    const errors = validateRegistration(registration)

    // Assert
    expect(errors.phone).toBeUndefined()
  })

  it('rechaza un teléfono al que le faltan dígitos', () => {
    // Arrange
    const registration = buildRegistration({ phone: '9999-888' })

    // Act
    const errors = validateRegistration(registration)

    // Assert
    expect(errors.phone).toBe('Escribe los 8 dígitos de tu número.')
  })

  it('rechaza un teléfono que no empieza como los números de Honduras', () => {
    // Arrange
    const registration = buildRegistration({ phone: '1234-5678' })

    // Act
    const errors = validateRegistration(registration)

    // Assert
    expect(errors.phone).toBe('Revisa el número: en Honduras empiezan por 2, 3, 7, 8 o 9.')
  })

  it('rechaza una contraseña más corta que el mínimo', () => {
    // Arrange
    const registration = buildRegistration({ password: 'a'.repeat(MIN_PASSWORD_LENGTH - 1) })

    // Act
    const errors = validateRegistration(registration)

    // Assert
    expect(errors.password).toBe(`Usa al menos ${MIN_PASSWORD_LENGTH} caracteres.`)
  })

  it('cuenta los espacios de la contraseña: se envían tal como se escriben', () => {
    // Arrange
    const withTrailingSpace = `${'a'.repeat(MIN_PASSWORD_LENGTH - 1)} `
    const registration = buildRegistration({ password: withTrailingSpace })

    // Act
    const errors = validateRegistration(registration)

    // Assert
    expect(errors.password).toBeUndefined()
  })

  it('no acepta una contraseña hecha solo de espacios', () => {
    // Arrange
    const registration = buildRegistration({ password: ' '.repeat(MIN_PASSWORD_LENGTH) })

    // Act
    const errors = validateRegistration(registration)

    // Assert
    expect(errors.password).toBe('Escribe tu contraseña.')
  })
})
