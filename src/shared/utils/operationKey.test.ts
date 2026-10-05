import { describe, expect, it, vi } from 'vitest'
import { createOperationKey } from '@/shared/utils/operationKey'

describe('createOperationKey', () => {
  it('devuelve una clave larga, solo con letras y números, que cabe en una cabecera o en una dirección', () => {
    // Arrange: sin datos de entrada

    // Act
    const key = createOperationKey()

    // Assert
    expect(key).toMatch(/^[0-9a-f]{32}$/)
  })

  it('no repite claves: cada operación recibe la suya', () => {
    // Arrange
    const count = 200

    // Act
    const keys = Array.from({ length: count }, () => createOperationKey())

    // Assert
    expect(new Set(keys).size).toBe(count)
  })

  it('funciona también en páginas servidas sin HTTPS, donde el navegador no ofrece randomUUID', () => {
    // Arrange
    vi.spyOn(crypto, 'randomUUID').mockImplementation(() => {
      throw new TypeError('crypto.randomUUID is not a function')
    })

    // Act
    const key = createOperationKey()

    // Assert
    expect(key).toMatch(/^[0-9a-f]{32}$/)
  })
})
