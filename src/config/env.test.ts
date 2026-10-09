import { describe, expect, it } from 'vitest'
import { toBackendConfig } from '@/config/env'

const URL = 'https://proyecto.supabase.co'
const PUBLIC_KEY = 'sb_publishable_clave'

describe('toBackendConfig', () => {
  it('toma la dirección del servicio y su clave pública, sin espacios sobrantes', () => {
    // Arrange
    const env = { VITE_SUPABASE_URL: ` ${URL} `, VITE_SUPABASE_PUBLISHABLE_KEY: ` ${PUBLIC_KEY}\n` }

    // Act
    const config = toBackendConfig(env)

    // Assert
    expect(config).toEqual({ url: URL, publicKey: PUBLIC_KEY })
  })

  it.each([
    { missing: 'la dirección', env: { VITE_SUPABASE_PUBLISHABLE_KEY: PUBLIC_KEY } },
    { missing: 'la clave pública', env: { VITE_SUPABASE_URL: URL } },
    { missing: 'una dirección válida', env: { VITE_SUPABASE_URL: 'proyecto', VITE_SUPABASE_PUBLISHABLE_KEY: PUBLIC_KEY } },
    { missing: 'ninguna de las dos variables', env: {} },
  ])('sin $missing deja el sitio sin servicio, en lugar de fallar al arrancar', ({ env }) => {
    // Arrange: una compilación a la que le falta parte de la configuración

    // Act
    const config = toBackendConfig(env)

    // Assert
    expect(config).toBeNull()
  })
})
