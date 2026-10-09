import { createMemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { landFromAuthLink } from '@/router/authLinkLanding'

const RECOVERY_HASH = '#access_token=pase&refresh_token=renovar&type=recovery'
const EXPIRED_HASH = '#error=access_denied&error_code=otp_expired'

/** Un enrutador abierto en la portada con lo que el enlace del correo dejó en la dirección. */
const openHomeWith = (hash: string) => createMemoryRouter([{ path: '*', element: null }], { initialEntries: [`/${hash}`] })

const whereIs = (router: ReturnType<typeof openHomeWith>) => router.state.location.pathname + router.state.location.hash

describe('landFromAuthLink', () => {
  it('lleva a elegir contraseña a quien vuelve del enlace de recuperación, conservando lo que el enlace trae', async () => {
    // Arrange
    const router = openHomeWith(RECOVERY_HASH)

    // Act
    await landFromAuthLink(router, 'recovery', RECOVERY_HASH)

    // Assert
    expect(whereIs(router)).toBe(`/restablecer-contrasena${RECOVERY_HASH}`)
  })

  it('lleva a la misma página a quien vuelve de un enlace que ya no vale, para que pueda pedir otro', async () => {
    // Arrange
    const router = openHomeWith(EXPIRED_HASH)

    // Act
    await landFromAuthLink(router, 'invalid', EXPIRED_HASH)

    // Assert
    expect(whereIs(router)).toBe(`/restablecer-contrasena${EXPIRED_HASH}`)
  })

  it('no mueve a quien llega de cualquier otra forma', async () => {
    // Arrange
    const router = openHomeWith('#quienes-somos')

    // Act
    await landFromAuthLink(router, 'none', '#quienes-somos')

    // Assert
    expect(whereIs(router)).toBe('/#quienes-somos')
  })
})
