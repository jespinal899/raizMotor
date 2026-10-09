import { describe, expect, it } from 'vitest'
import { createSessionVault } from '@/lib/sessionVault'
import { memoryStorage } from '@/test/memoryStorage'

const KEY = 'sb-proyecto-auth-token'

interface Stored {
  durable?: Record<string, string>
  temporary?: Record<string, string>
}

const setup = (stored: Stored = {}) => {
  const durable = memoryStorage(stored.durable)
  const temporary = memoryStorage(stored.temporary)

  return { durable, temporary, vault: createSessionVault(durable, temporary) }
}

describe('createSessionVault', () => {
  it('guarda la sesión de forma duradera cuando la persona pidió que se la recuerde', () => {
    // Arrange
    const { vault, durable, temporary } = setup()
    vault.remember(true)

    // Act
    vault.setItem(KEY, 'sesión')

    // Assert
    expect(durable.getItem(KEY)).toBe('sesión')
    expect(temporary.getItem(KEY)).toBeNull()
  })

  it('la guarda solo para esta pestaña cuando no lo pidió', () => {
    // Arrange
    const { vault, durable, temporary } = setup()
    vault.remember(false)

    // Act
    vault.setItem(KEY, 'sesión')

    // Assert
    expect(temporary.getItem(KEY)).toBe('sesión')
    expect(durable.getItem(KEY)).toBeNull()
  })

  it('si nadie eligió, la recuerda: así queda quien llega desde el enlace de confirmación', () => {
    // Arrange
    const { vault, durable } = setup()

    // Act
    vault.setItem(KEY, 'sesión')

    // Assert
    expect(durable.getItem(KEY)).toBe('sesión')
  })

  it('al renovarse tras recargar la página, la sesión de una pestaña sigue siendo solo de esa pestaña', () => {
    // Arrange
    const { vault, durable, temporary } = setup({ temporary: { [KEY]: 'sesión' } })

    // Act
    vault.setItem(KEY, 'sesión renovada')

    // Assert
    expect(temporary.getItem(KEY)).toBe('sesión renovada')
    expect(durable.getItem(KEY)).toBeNull()
  })

  it('al entrar sin pedir que se recuerde, no deja la sesión anterior guardada en el dispositivo', () => {
    // Arrange
    const { vault, durable, temporary } = setup({ durable: { [KEY]: 'sesión anterior' } })
    vault.remember(false)

    // Act
    vault.setItem(KEY, 'sesión nueva')

    // Assert
    expect(temporary.getItem(KEY)).toBe('sesión nueva')
    expect(durable.getItem(KEY)).toBeNull()
  })

  it.each(['durable', 'temporary'] as const)('lee la sesión esté donde esté (%s)', (place) => {
    // Arrange
    const { vault } = setup({ [place]: { [KEY]: 'sesión' } })

    // Act
    const session = vault.getItem(KEY)

    // Assert
    expect(session).toBe('sesión')
  })

  it('al cerrar la sesión la borra de los dos almacenes', () => {
    // Arrange
    const { vault, durable, temporary } = setup({ durable: { [KEY]: 'una' }, temporary: { [KEY]: 'otra' } })

    // Act
    vault.removeItem(KEY)

    // Assert
    expect(durable.getItem(KEY)).toBeNull()
    expect(temporary.getItem(KEY)).toBeNull()
  })
})
