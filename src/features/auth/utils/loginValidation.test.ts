import { describe, expect, it } from 'vitest'
import type { LoginCredentials } from '@/features/auth/types/auth.types'
import { validateLogin } from '@/features/auth/utils/loginValidation'
import { hasErrors } from '@/shared/utils/validators'

const validCredentials = (overrides: Partial<LoginCredentials> = {}): LoginCredentials => ({
  email: 'ana@gmail.com',
  password: 'secreta123',
  remember: false,
  ...overrides,
})

describe('validateLogin', () => {
  it('no encuentra errores con correo y contraseña bien escritos', () => {
    // Arrange
    const credentials = validCredentials()

    // Act
    const errors = validateLogin(credentials)

    // Assert
    expect(hasErrors(errors)).toBe(false)
  })

  it('exige el correo y la contraseña', () => {
    // Arrange
    const credentials = validCredentials({ email: '  ', password: '' })

    // Act
    const errors = validateLogin(credentials)

    // Assert
    expect(errors).toEqual({ email: 'Escribe tu correo.', password: 'Escribe tu contraseña.' })
  })

  it('rechaza un correo mal escrito', () => {
    // Arrange
    const credentials = validCredentials({ email: 'ana@gmail' })

    // Act
    const errors = validateLogin(credentials)

    // Assert
    expect(errors.email).toBe('Revisa el correo: debe tener el formato nombre@dominio.com.')
  })

  it('no impone reglas de longitud a la contraseña: eso se decide al crear la cuenta', () => {
    // Arrange
    const credentials = validCredentials({ password: 'a' })

    // Act
    const errors = validateLogin(credentials)

    // Assert
    expect(errors.password).toBeUndefined()
  })
})
