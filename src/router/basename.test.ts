import { describe, expect, it } from 'vitest'
import { toRouterBasename } from '@/router/basename'

describe('toRouterBasename', () => {
  it('mantiene la raíz cuando el sitio se sirve desde el dominio', () => {
    // Arrange
    const baseUrl = '/'

    // Act
    const basename = toRouterBasename(baseUrl)

    // Assert
    expect(basename).toBe('/')
  })

  it('quita la barra final del prefijo de GitHub Pages', () => {
    // Arrange
    const baseUrl = '/raizMotor/'

    // Act
    const basename = toRouterBasename(baseUrl)

    // Assert
    expect(basename).toBe('/raizMotor')
  })

  it('conserva los prefijos de varios niveles', () => {
    // Arrange
    const baseUrl = '/clientes/domus/'

    // Act
    const basename = toRouterBasename(baseUrl)

    // Assert
    expect(basename).toBe('/clientes/domus')
  })

  it('usa la raíz si el prefijo llega vacío', () => {
    // Arrange
    const baseUrl = ''

    // Act
    const basename = toRouterBasename(baseUrl)

    // Assert
    expect(basename).toBe('/')
  })
})
