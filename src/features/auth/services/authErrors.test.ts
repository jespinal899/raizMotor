import { describe, expect, it } from 'vitest'
import {
  AuthUnavailableError,
  EmailNotConfirmedError,
  EmailTakenError,
  GoogleAccessUnavailableError,
  InvalidCredentialsError,
  RegistrationUnavailableError,
} from '@/features/auth/services/authErrors'

describe('errores de acceso', () => {
  it.each([
    { ErrorClass: AuthUnavailableError, name: 'AuthUnavailableError' },
    { ErrorClass: InvalidCredentialsError, name: 'InvalidCredentialsError' },
    { ErrorClass: RegistrationUnavailableError, name: 'RegistrationUnavailableError' },
    { ErrorClass: EmailNotConfirmedError, name: 'EmailNotConfirmedError' },
    { ErrorClass: EmailTakenError, name: 'EmailTakenError' },
    { ErrorClass: GoogleAccessUnavailableError, name: 'GoogleAccessUnavailableError' },
  ])('$name es un Error con nombre propio, para distinguirlo de un fallo de red', ({ ErrorClass, name }) => {
    // Arrange: no necesita datos

    // Act
    const error = new ErrorClass()

    // Assert
    expect(error).toBeInstanceOf(Error)
    expect(error.name).toBe(name)
  })
})
