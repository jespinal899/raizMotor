import { describe, expect, it } from 'vitest'
import { readAuthLink } from '@/features/auth/utils/authLink'

describe('readAuthLink', () => {
  it.each([
    {
      when: 'trae una sesión para elegir otra contraseña',
      hash: '#access_token=pase&refresh_token=renovar&expires_in=3600&type=recovery',
      expected: 'recovery',
    },
    {
      when: 'el enlace caducó o ya se usó',
      hash: '#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired',
      expected: 'invalid',
    },
    {
      when: 'trae la sesión de quien confirma su cuenta',
      hash: '#access_token=pase&refresh_token=renovar&type=signup',
      expected: 'none',
    },
    { when: 'apunta a una sección de la página', hash: '#quienes-somos', expected: 'none' },
    { when: 'no trae nada', hash: '', expected: 'none' },
  ])('es "$expected" cuando la dirección $when', ({ hash, expected }) => {
    // Arrange: la parte de la dirección que sigue a la almohadilla

    // Act
    const link = readAuthLink(hash)

    // Assert
    expect(link).toBe(expected)
  })
})
