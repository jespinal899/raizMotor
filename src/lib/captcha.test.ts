import { describe, expect, it, vi } from 'vitest'
import { CAPTCHA_SITE_KEY, createCaptchaSession, toCaptchaSiteKey } from '@/lib/captcha'

describe('toCaptchaSiteKey', () => {
  it('toma la clave del sitio sin espacios sobrantes', () => {
    // Arrange
    const env = { VITE_TURNSTILE_SITE_KEY: ' 0x4AAAA-clave \n' }

    // Act
    const key = toCaptchaSiteKey(env)

    // Assert
    expect(key).toBe('0x4AAAA-clave')
  })

  it.each([{}, { VITE_TURNSTILE_SITE_KEY: '' }, { VITE_TURNSTILE_SITE_KEY: '   ' }])(
    'sin clave no hay verificación: %j',
    (env) => {
      // Arrange: compilación sin la variable

      // Act
      const key = toCaptchaSiteKey(env)

      // Assert
      expect(key).toBeNull()
    },
  )

  it('en las pruebas no hay verificación', () => {
    // Arrange: la configuración de Vitest no trae la variable

    // Act
    const key = CAPTCHA_SITE_KEY

    // Assert
    expect(key).toBeNull()
  })
})

describe('createCaptchaSession', () => {
  it('entrega el token una sola vez: después ya está usado', () => {
    // Arrange
    const session = createCaptchaSession()
    session.setToken('token-1')

    // Act
    const first = session.takeToken()
    const second = session.takeToken()

    // Assert
    expect(first).toBe('token-1')
    expect(second).toBeNull()
  })

  it('al usar el token avisa para reiniciar el widget, hasta que se deja de escuchar', () => {
    // Arrange
    const session = createCaptchaSession()
    const reset = vi.fn()
    const stop = session.onReset(reset)

    // Act
    session.takeToken()
    stop()
    session.takeToken()

    // Assert
    expect(reset).toHaveBeenCalledOnce()
  })

  it('un token que caducó deja de entregarse', () => {
    // Arrange
    const session = createCaptchaSession()
    session.setToken('token-1')

    // Act
    session.setToken(null)

    // Assert
    expect(session.takeToken()).toBeNull()
  })
})
