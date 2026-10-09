import { describe, expect, it, vi } from 'vitest'
import { AuthUnavailableError, RegistrationUnavailableError } from '@/features/auth/services/authErrors'
import { ACCOUNTS_AVAILABLE, authService, createPendingAuthService } from '@/features/auth/services/authService'
import type { LoginCredentials } from '@/features/auth/types/auth.types'
import { buildRegistration } from '@/test/factories'
import { TEST_OPERATION_KEY } from '@/test/operationKey'

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

  it('rechaza entrar con Google indicando que aún no está configurado, en lugar de fingirlo', async () => {
    // Arrange
    const service = createPendingAuthService()

    // Act
    const login = service.loginWithGoogle()

    // Assert
    await expect(login).rejects.toBeInstanceOf(AuthUnavailableError)
  })

  it('rechaza el registro indicando que aún no está configurado, en lugar de fingirlo', async () => {
    // Arrange
    const service = createPendingAuthService()

    // Act
    const registration = service.register(buildRegistration(), TEST_OPERATION_KEY)

    // Assert
    await expect(registration).rejects.toBeInstanceOf(RegistrationUnavailableError)
  })

  it('rechaza pedir el enlace para elegir otra contraseña, en lugar de fingir que lo envió', async () => {
    // Arrange
    const service = createPendingAuthService()

    // Act
    const request = service.requestPasswordReset('ana@gmail.com')

    // Assert
    await expect(request).rejects.toBeInstanceOf(AuthUnavailableError)
  })

  it('rechaza guardar una contraseña nueva y dice que nadie llegó desde un enlace de recuperación', async () => {
    // Arrange
    const service = createPendingAuthService()

    // Act
    const change = service.changePassword('otra-secreta-456', TEST_OPERATION_KEY)

    // Assert
    expect(service.isRecoveringPassword()).toBe(false)
    await expect(change).rejects.toBeInstanceOf(AuthUnavailableError)
  })

  it('rechaza guardar los datos de una cuenta, en lugar de fingir que los guardó', async () => {
    // Arrange
    const service = createPendingAuthService()

    // Act
    const saving = service.updateProfile({ firstName: 'Ana', lastName: 'Mejía', phone: '+50499999999' })

    // Assert
    await expect(saving).rejects.toBeInstanceOf(AuthUnavailableError)
  })

  it('dice que nadie tiene la sesión abierta, porque sin cuentas no puede haberla', () => {
    // Arrange
    const service = createPendingAuthService()
    const listener = vi.fn()

    // Act
    service.onSessionChange(listener)

    // Assert
    expect(listener).toHaveBeenCalledExactlyOnceWith(null)
  })

  it('cerrar sesión no hace nada: no hay ninguna abierta', async () => {
    // Arrange
    const service = createPendingAuthService()

    // Act
    const logout = service.logout()

    // Assert
    await expect(logout).resolves.toBeUndefined()
  })
})

describe('authService', () => {
  it('sin el servicio de cuentas configurado, la aplicación lo dice y no inicia ninguna sesión', async () => {
    // Arrange: las pruebas se ejecutan sin las variables del servicio
    const service = authService

    // Act
    const login = service.login(CREDENTIALS)

    // Assert
    expect(ACCOUNTS_AVAILABLE).toBe(false)
    await expect(login).rejects.toBeInstanceOf(AuthUnavailableError)
  })

  it('sin el servicio de cuentas configurado, la aplicación no crea ninguna cuenta', async () => {
    // Arrange
    const service = authService

    // Act
    const registration = service.register(buildRegistration(), TEST_OPERATION_KEY)

    // Assert
    await expect(registration).rejects.toBeInstanceOf(RegistrationUnavailableError)
  })
})
