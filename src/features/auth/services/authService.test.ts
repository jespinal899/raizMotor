import { describe, expect, it } from 'vitest'
import {
  AuthUnavailableError,
  InvalidCredentialsError,
  RegistrationUnavailableError,
  authService,
  createPendingAuthService,
} from '@/features/auth/services/authService'
import type { LoginCredentials } from '@/features/auth/types/auth.types'
import { buildRegistration } from '@/test/factories'

const CREDENTIALS: LoginCredentials = { email: 'ana@gmail.com', password: 'secreta123', remember: false }

describe('createPendingAuthService', () => {
  it('rechaza el inicio de sesión indicando que aún no está configurado, en lugar de fingirlo', async () => {
    // Arrange
    const service = createPendingAuthService()

    // Act
    const login = service.login(CREDENTIALS)

    // Assert
    await expect(login).rejects.toBeInstanceOf(AuthUnavailableError)
  })
})

describe('errores de autenticación', () => {
  it.each([
    { ErrorClass: AuthUnavailableError, name: 'AuthUnavailableError' },
    { ErrorClass: InvalidCredentialsError, name: 'InvalidCredentialsError' },
    { ErrorClass: RegistrationUnavailableError, name: 'RegistrationUnavailableError' },
  ])('$name es un Error con nombre propio, para distinguirlo de un fallo de red', ({ ErrorClass, name }) => {
    // Arrange: no necesita datos

    // Act
    const error = new ErrorClass()

    // Assert
    expect(error).toBeInstanceOf(Error)
    expect(error.name).toBe(name)
  })
})

describe('authService', () => {
  it('mientras no existan las cuentas, el servicio de la aplicación no inicia ninguna sesión', async () => {
    // Arrange
    const service = authService

    // Act
    const login = service.login(CREDENTIALS)

    // Assert
    await expect(login).rejects.toBeInstanceOf(AuthUnavailableError)
  })
})

describe('entrar con Google', () => {
  it('el servicio provisional lo rechaza indicando que aún no está configurado, en lugar de fingirlo', async () => {
    // Arrange
    const service = createPendingAuthService()

    // Act
    const login = service.loginWithGoogle()

    // Assert
    await expect(login).rejects.toBeInstanceOf(AuthUnavailableError)
  })

  it('mientras no existan las cuentas, el servicio de la aplicación tampoco inicia sesión con Google', async () => {
    // Arrange
    const service = authService

    // Act
    const login = service.loginWithGoogle()

    // Assert
    await expect(login).rejects.toBeInstanceOf(AuthUnavailableError)
  })
})

describe('crear una cuenta', () => {
  it('el servicio provisional lo rechaza indicando que el registro aún no está configurado, en lugar de fingirlo', async () => {
    // Arrange
    const service = createPendingAuthService()

    // Act
    const registration = service.register(buildRegistration())

    // Assert
    await expect(registration).rejects.toBeInstanceOf(RegistrationUnavailableError)
  })

  it('mientras no existan las cuentas, el servicio de la aplicación no crea ninguna', async () => {
    // Arrange
    const service = authService

    // Act
    const registration = service.register(buildRegistration())

    // Assert
    await expect(registration).rejects.toBeInstanceOf(RegistrationUnavailableError)
  })
})
