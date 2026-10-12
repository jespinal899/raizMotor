import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  CAPTCHA_SITE_KEY,
  TOKEN_WAIT_MS,
  createCaptchaSession,
  takeCaptchaToken,
  toCaptchaSiteKey,
} from '@/lib/captcha'

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
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('entrega el token una sola vez: después ya está usado', async () => {
    // Arrange
    const session = createCaptchaSession()
    session.setToken('token-1')

    // Act
    const first = await session.takeToken()
    const second = await session.takeToken(0)

    // Assert
    expect(first).toBe('token-1')
    expect(second).toBeNull()
  })

  it('si la comprobación en segundo plano aún no terminó, espera el token al enviar', async () => {
    // Arrange
    const session = createCaptchaSession()

    // Act
    const taking = session.takeToken()
    await vi.advanceTimersByTimeAsync(2000)
    session.setToken('token-tardio')

    // Assert
    await expect(taking).resolves.toBe('token-tardio')
  })

  it(`si el token no llega en ${TOKEN_WAIT_MS / 1000} segundos, deja de esperar y no entrega ninguno`, async () => {
    // Arrange
    const session = createCaptchaSession()

    // Act
    const taking = session.takeToken()
    await vi.advanceTimersByTimeAsync(TOKEN_WAIT_MS)

    // Assert
    await expect(taking).resolves.toBeNull()
  })

  it('al usar el token avisa para reiniciar el widget, hasta que se deja de escuchar', async () => {
    // Arrange
    const session = createCaptchaSession()
    const reset = vi.fn()
    const stop = session.onReset(reset)

    // Act
    await session.takeToken(0)
    stop()
    await session.takeToken(0)

    // Assert
    expect(reset).toHaveBeenCalledOnce()
  })

  it('un token que caducó deja de entregarse', async () => {
    // Arrange
    const session = createCaptchaSession()
    session.setToken('token-1')

    // Act
    session.setToken(null)

    // Assert
    await expect(session.takeToken(0)).resolves.toBeNull()
  })
})

describe('takeCaptchaToken', () => {
  it('sin clave del sitio no espera un token: no hay verificación que lo entregue', async () => {
    // Arrange
    const session = createCaptchaSession()
    const takeToken = vi.spyOn(session, 'takeToken')

    // Act
    const token = await takeCaptchaToken(null, session)

    // Assert
    expect(token).toBeNull()
    expect(takeToken).not.toHaveBeenCalled()
  })

  it('con clave del sitio entrega el token de la verificación', async () => {
    // Arrange
    const session = createCaptchaSession()
    session.setToken('token-1')

    // Act
    const token = await takeCaptchaToken('clave-del-sitio', session)

    // Assert
    expect(token).toBe('token-1')
  })
})
