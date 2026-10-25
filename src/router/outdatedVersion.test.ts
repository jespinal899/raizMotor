import { beforeEach, describe, expect, it, vi } from 'vitest'
import { isOutdatedVersionError, reloadOnce } from '@/router/outdatedVersion'

describe('isOutdatedVersionError', () => {
  it.each([
    ['Chrome', 'Failed to fetch dynamically imported module: https://sitio/assets/SearchPage-abc.js'],
    ['Firefox', 'error loading dynamically imported module: https://sitio/assets/SearchPage-abc.js'],
    ['Safari', 'Importing a module script failed.'],
  ])('reconoce la parte del sitio que ya no existe en %s', (_browser, message) => {
    // Arrange
    const error = new TypeError(message)

    // Act
    const outdated = isOutdatedVersionError(error)

    // Assert
    expect(outdated).toBe(true)
  })

  it('no confunde otro fallo con una versión vieja', () => {
    // Arrange
    const error = new Error('No se pudo leer el anuncio')

    // Act
    const outdated = isOutdatedVersionError(error)

    // Assert
    expect(outdated).toBe(false)
  })
})

describe('reloadOnce', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('recarga la página la primera vez', () => {
    // Arrange
    const reload = vi.fn()

    // Act
    const reloaded = reloadOnce(reload, 1_000)

    // Assert
    expect(reloaded).toBe(true)
    expect(reload).toHaveBeenCalledOnce()
  })

  it('no vuelve a recargar si acaba de hacerlo: el fallo no era una versión vieja', () => {
    // Arrange
    const reload = vi.fn()
    reloadOnce(reload, 1_000)

    // Act
    const reloaded = reloadOnce(reload, 5_000)

    // Assert
    expect(reloaded).toBe(false)
    expect(reload).toHaveBeenCalledOnce()
  })

  it('recarga otra vez pasado un rato, con la siguiente versión publicada', () => {
    // Arrange
    const reload = vi.fn()
    reloadOnce(reload, 1_000)

    // Act
    const reloaded = reloadOnce(reload, 60_000)

    // Assert
    expect(reloaded).toBe(true)
    expect(reload).toHaveBeenCalledTimes(2)
  })
})
