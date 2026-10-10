import { describe, expect, it } from 'vitest'

import { PROBLEMS, findProblems, parseEnvFile } from './productionEnv.mjs'

const URL = 'https://proyecto.supabase.co'
const PUBLISHABLE_KEY = 'sb_publishable_clave'

/** Una clave antigua de mentira, con el rol que diga la prueba: solo importa su contenido, no su firma. */
const legacyKey = (role) =>
  ['cabecera', Buffer.from(JSON.stringify({ role })).toString('base64url'), 'firma'].join('.')

describe('parseEnvFile', () => {
  it('lee las variables con y sin comillas, e ignora comentarios y líneas vacías', () => {
    // Arrange
    const text = [
      '# Creado por Vercel CLI',
      '',
      `VITE_SUPABASE_URL="${URL}"`,
      `VITE_SUPABASE_PUBLISHABLE_KEY=${PUBLISHABLE_KEY}`,
      "VERCEL_ENV='production'",
    ].join('\n')

    // Act
    const env = parseEnvFile(text)

    // Assert
    expect(env).toEqual({
      VITE_SUPABASE_URL: URL,
      VITE_SUPABASE_PUBLISHABLE_KEY: PUBLISHABLE_KEY,
      VERCEL_ENV: 'production',
    })
  })
})

describe('findProblems', () => {
  it('no encuentra ninguno con la dirección del proyecto y su clave pública', () => {
    // Arrange
    const env = { VITE_SUPABASE_URL: URL, VITE_SUPABASE_PUBLISHABLE_KEY: PUBLISHABLE_KEY }

    // Act
    const problems = findProblems(env)

    // Assert
    expect(problems).toEqual([])
  })

  it('acepta la antigua clave «anon»', () => {
    // Arrange
    const env = { VITE_SUPABASE_URL: URL, VITE_SUPABASE_PUBLISHABLE_KEY: legacyKey('anon') }

    // Act
    const problems = findProblems(env)

    // Assert
    expect(problems).toEqual([])
  })

  it('avisa de las dos variables si no llegó ninguna', () => {
    // Arrange
    const env = {}

    // Act
    const problems = findProblems(env)

    // Assert
    expect(problems).toEqual([PROBLEMS.missingUrl, PROBLEMS.missingKey])
  })

  it.each(['proyecto.supabase.co', 'http://proyecto.supabase.co'])('rechaza %j como dirección', (url) => {
    // Arrange
    const env = { VITE_SUPABASE_URL: url, VITE_SUPABASE_PUBLISHABLE_KEY: PUBLISHABLE_KEY }

    // Act
    const problems = findProblems(env)

    // Assert
    expect(problems).toEqual([PROBLEMS.invalidUrl])
  })

  it.each([
    ['la clave «secret»', 'sb_secret_clave'],
    ['la antigua «service_role»', legacyKey('service_role')],
  ])('detiene la publicación si se puso %s, que daría acceso total a quien abra el sitio', (_case, key) => {
    // Arrange
    const env = { VITE_SUPABASE_URL: URL, VITE_SUPABASE_PUBLISHABLE_KEY: key }

    // Act
    const problems = findProblems(env)

    // Assert
    expect(problems).toEqual([PROBLEMS.privilegedKey])
  })

  it('ningún aviso muestra el valor de una variable', () => {
    // Arrange
    const secret = 'sb_secret_no_debe_verse'
    const env = { VITE_SUPABASE_URL: 'http://no-debe-verse', VITE_SUPABASE_PUBLISHABLE_KEY: secret }

    // Act
    const problems = findProblems(env).join('\n')

    // Assert
    expect(problems).not.toContain(secret)
    expect(problems).not.toContain('no-debe-verse')
  })
})
