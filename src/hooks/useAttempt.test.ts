import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useAttempt } from '@/hooks/useAttempt'
import { deferred } from '@/test/deferred'

type InProgress = 'submitting' | 'connecting'
type Failure = 'unavailable' | 'failed'

class UnavailableError extends Error {}

const toFailure = (reason: unknown): Failure => (reason instanceof UnavailableError ? 'unavailable' : 'failed')

const setup = () => renderHook(() => useAttempt<InProgress, Failure>(toFailure))

describe('useAttempt', () => {
  it('empieza en reposo', () => {
    // Arrange: ninguna acción iniciada

    // Act
    const { result } = setup()

    // Assert
    expect(result.current.status).toBe('idle')
  })

  it('mientras la acción está en curso muestra el estado indicado y, si termina bien, vuelve al reposo', async () => {
    // Arrange
    const { promise, finish } = deferred()
    const { result } = setup()

    // Act
    let attempt: Promise<void> = Promise.resolve()
    act(() => {
      attempt = result.current.attempt('connecting', () => promise)
    })
    const statusWhileRunning = result.current.status
    await act(async () => {
      finish()
      await attempt
    })

    // Assert
    expect(statusWhileRunning).toBe('connecting')
    expect(result.current.status).toBe('idle')
  })

  it.each([
    { reason: new UnavailableError(), expected: 'unavailable' },
    { reason: new Error('sin conexión'), expected: 'failed' },
  ])('si la acción falla, el estado es el motivo traducido ($expected)', async ({ reason, expected }) => {
    // Arrange
    const { result } = setup()

    // Act
    await act(() => result.current.attempt('submitting', () => Promise.reject(reason)))

    // Assert
    expect(result.current.status).toBe(expected)
  })

  it('reset retira el resultado de un intento fallido', async () => {
    // Arrange
    const { result } = setup()
    await act(() => result.current.attempt('submitting', () => Promise.reject(new Error('sin conexión'))))

    // Act
    act(() => result.current.reset())

    // Assert
    expect(result.current.status).toBe('idle')
  })
})
