import { describe, expect, it, vi } from 'vitest'
import { createOperationLog } from '@/shared/utils/operationLog'

const KEY = 'clave-de-la-operación'

describe('createOperationLog', () => {
  it('ejecuta la operación la primera vez que llega su clave y entrega su resultado', async () => {
    // Arrange
    const once = createOperationLog<string>()
    const run = vi.fn(async () => 'hecho')

    // Act
    const result = await once(KEY, run)

    // Assert
    expect(run).toHaveBeenCalledOnce()
    expect(result).toBe('hecho')
  })

  it('repetir una clave ya atendida no ejecuta la operación otra vez y entrega el mismo resultado', async () => {
    // Arrange
    const once = createOperationLog<string>()
    const run = vi.fn(async () => 'hecho')
    await once(KEY, run)

    // Act
    const repeated = await once(KEY, run)

    // Assert
    expect(run).toHaveBeenCalledOnce()
    expect(repeated).toBe('hecho')
  })

  it('dos envíos seguidos con la misma clave, el primero aún en curso, comparten una sola operación', async () => {
    // Arrange
    const once = createOperationLog<string>()
    const run = vi.fn(async () => 'hecho')

    // Act
    const results = await Promise.all([once(KEY, run), once(KEY, run)])

    // Assert
    expect(run).toHaveBeenCalledOnce()
    expect(results).toEqual(['hecho', 'hecho'])
  })

  it('una operación que falló no queda hecha: reintentarla con la misma clave la ejecuta de nuevo', async () => {
    // Arrange
    const once = createOperationLog<string>()
    const run = vi.fn<() => Promise<string>>().mockRejectedValueOnce(new Error('sin conexión')).mockResolvedValue('hecho')
    await once(KEY, run).catch(() => {})

    // Act
    const retried = await once(KEY, run)

    // Assert
    expect(run).toHaveBeenCalledTimes(2)
    expect(retried).toBe('hecho')
  })

  it('claves distintas son operaciones distintas', async () => {
    // Arrange
    const once = createOperationLog<string>()
    const run = vi.fn(async () => 'hecho')
    await once(KEY, run)

    // Act
    await once('otra-clave', run)

    // Assert
    expect(run).toHaveBeenCalledTimes(2)
  })
})
