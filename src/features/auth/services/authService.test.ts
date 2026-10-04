import { describe, expect, it } from 'vitest'
import {
  AuthUnavailableError,
  InvalidCredentialsError,
  authService,
  createPendingAuthService,
} from '@/features/auth/services/authService'
import type { LoginCredentials } from '@/features/auth/types/auth.types'

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
