import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { BATCH_SIZE, MAX_BATCHES, handleCleanup, sameSecret } from './cleanup.ts'
import type { CleanupDependencies } from './cleanup.ts'

const SECRET = 'secreto-de-prueba-con-mas-de-32-caracteres'
const URL_BASE = 'https://proyecto.supabase.co/functions/v1/cleanup-photos'

const paths = (count: number, from = 0) => Array.from({ length: count }, (_, index) => `cuenta/clave/${from + index}.webp`)

/** Un depósito con `total` fotos sobrantes: cada consulta entrega las que aún no se borraron. */
const depsWith = (total: number, overrides: Partial<CleanupDependencies> = {}): CleanupDependencies => {
  let left = total

  return {
    listOrphans: vi.fn(async (limit: number) => paths(Math.min(limit, left), total - left)),
    countOrphans: vi.fn(async () => left),
    removePhotos: vi.fn(async (removed: string[]) => {
      left -= removed.length

      return removed.length
    }),
    secret: SECRET,
    ...overrides,
  }
}

const call = ({ secret = SECRET, method = 'POST', query = '' } = {}) =>
  new Request(`${URL_BASE}${query}`, { method, headers: secret ? { 'x-cleanup-secret': secret } : {} })

beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => {})
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('sameSecret', () => {
  it('solo acepta el secreto exacto', () => {
    // Arrange: secretos de prueba

    // Act
    const results = [sameSecret(SECRET, SECRET), sameSecret(`${SECRET}x`, SECRET), sameSecret('', SECRET)]

    // Assert
    expect(results).toEqual([true, false, false])
  })
})

describe('handleCleanup', () => {
  it('sin el secreto, o con otro, no borra nada', async () => {
    // Arrange
    const dependencies = depsWith(5)

    // Act
    const missing = await handleCleanup(call({ secret: '' }), dependencies)
    const wrong = await handleCleanup(call({ secret: 'otro-secreto' }), dependencies)

    // Assert
    expect([missing.status, wrong.status]).toEqual([401, 401])
    expect(dependencies.listOrphans).not.toHaveBeenCalled()
    expect(dependencies.removePhotos).not.toHaveBeenCalled()
  })

  it('solo admite POST', async () => {
    // Arrange
    const dependencies = depsWith(5)

    // Act
    const response = await handleCleanup(call({ method: 'GET' }), dependencies)

    // Assert
    expect(response.status).toBe(405)
    expect(dependencies.removePhotos).not.toHaveBeenCalled()
  })

  it('en modo de prueba solo cuenta cuántas sobran', async () => {
    // Arrange
    const dependencies = depsWith(1500)

    // Act
    const response = await handleCleanup(call({ query: '?dry_run=1' }), dependencies)

    // Assert
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ dryRun: true, orphans: 1500 })
    expect(dependencies.listOrphans).not.toHaveBeenCalled()
    expect(dependencies.removePhotos).not.toHaveBeenCalled()
  })

  it('borra las que sobran y dice cuántas', async () => {
    // Arrange
    const dependencies = depsWith(3)

    // Act
    const response = await handleCleanup(call(), dependencies)

    // Assert
    expect(await response.json()).toEqual({ deleted: 3, more: false })
    expect(dependencies.removePhotos).toHaveBeenCalledExactlyOnceWith(paths(3))
  })

  it('si no sobra ninguna, no llama al borrado', async () => {
    // Arrange
    const dependencies = depsWith(0)

    // Act
    const response = await handleCleanup(call(), dependencies)

    // Assert
    expect(await response.json()).toEqual({ deleted: 0, more: false })
    expect(dependencies.removePhotos).not.toHaveBeenCalled()
  })

  it('borra por tandas hasta que no queda ninguna', async () => {
    // Arrange
    const dependencies = depsWith(BATCH_SIZE * 2 + 10)

    // Act
    const response = await handleCleanup(call(), dependencies)

    // Assert
    expect(await response.json()).toEqual({ deleted: BATCH_SIZE * 2 + 10, more: false })
    expect(dependencies.removePhotos).toHaveBeenCalledTimes(3)
  })

  it('no pasa del máximo de tandas por ejecución y avisa de que quedan más', async () => {
    // Arrange
    const dependencies = depsWith(BATCH_SIZE * (MAX_BATCHES + 1))

    // Act
    const response = await handleCleanup(call(), dependencies)

    // Assert
    expect(await response.json()).toEqual({ deleted: BATCH_SIZE * MAX_BATCHES, more: true })
    expect(dependencies.removePhotos).toHaveBeenCalledTimes(MAX_BATCHES)
  })

  it('si Storage no borra ninguna, no vuelve a pedir las mismas', async () => {
    // Arrange
    const dependencies = depsWith(BATCH_SIZE * 3, { removePhotos: vi.fn(async () => 0) })

    // Act
    const response = await handleCleanup(call(), dependencies)

    // Assert
    expect(await response.json()).toEqual({ deleted: 0, more: true })
    expect(dependencies.removePhotos).toHaveBeenCalledOnce()
  })

  it('si falla a medias, responde el fallo con lo que alcanzó a borrar', async () => {
    // Arrange
    const removePhotos = vi
      .fn<CleanupDependencies['removePhotos']>()
      .mockResolvedValueOnce(BATCH_SIZE)
      .mockRejectedValueOnce(new Error('Storage no respondió'))
    const dependencies = depsWith(BATCH_SIZE * 3, { removePhotos })

    // Act
    const response = await handleCleanup(call(), dependencies)

    // Assert
    expect(response.status).toBe(500)
    expect(await response.json()).toEqual({ error: 'cleanup_failed', deleted: BATCH_SIZE })
  })

  it('en los registros deja cuántas borró, nunca cuáles', async () => {
    // Arrange
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})

    // Act
    await handleCleanup(call(), depsWith(2))

    // Assert
    expect(log).toHaveBeenCalledWith('cleanup-photos: borradas 2 fotos.')
    expect(String(log.mock.calls)).not.toContain('cuenta/clave')
  })
})
