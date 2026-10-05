import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useAttempt } from '@/hooks/useAttempt'
import { deferred } from '@/test/deferred'

type InProgress = 'submitting' | 'connecting'
type Failure = 'unavailable' | 'failed'

class UnavailableError extends Error {}

const toFailure = (reason: unknown): Failure => (reason instanceof UnavailableError ? 'unavailable' : 'failed')

/** Intento que vuelve al reposo al terminar bien, como el acceso: después se cambia de página. */
const setup = () => renderHook(() => useAttempt<InProgress, Failure>({ toFailure }))

/** Intento que recuerda que terminó bien, como un envío: la pantalla sigue ahí con su aviso. */
const setupWithSuccess = () =>
  renderHook(() => useAttempt<InProgress, Failure, 'sent'>({ toFailure, succeeded: 'sent' }))

type Action = (operationKey: string) => Promise<void>

const succeed = () => vi.fn<Action>(async () => {})
const fail = (reason: unknown = new Error('sin conexión')) => vi.fn<Action>(() => Promise.reject(reason))

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
    await act(() => result.current.attempt('submitting', fail(reason)))

    // Assert
    expect(result.current.status).toBe(expected)
  })

  it('reset retira el resultado de un intento fallido', async () => {
    // Arrange
    const { result } = setup()
    await act(() => result.current.attempt('submitting', fail()))

    // Act
    act(() => result.current.reset())

    // Assert
    expect(result.current.status).toBe('idle')
  })
})

describe('useAttempt: repetir no duplica', () => {
  it('pedir lo mismo dos veces mientras está en curso ejecuta la acción una sola vez', async () => {
    // Arrange
    const { promise, finish } = deferred()
    const action = vi.fn<Action>(() => promise)
    const { result } = setup()

    // Act
    let first: Promise<void> = Promise.resolve()
    let second: Promise<void> = Promise.resolve()
    act(() => {
      first = result.current.attempt('submitting', action)
      second = result.current.attempt('submitting', action)
    })
    await act(async () => {
      finish()
      await Promise.all([first, second])
    })

    // Assert
    expect(action).toHaveBeenCalledOnce()
    expect(result.current.status).toBe('idle')
  })

  it('cuando termina, se puede volver a intentar', async () => {
    // Arrange
    const action = fail()
    const { result } = setup()
    await act(() => result.current.attempt('submitting', action))

    // Act
    await act(() => result.current.attempt('submitting', action))

    // Assert
    expect(action).toHaveBeenCalledTimes(2)
  })

  it('una acción que falla nada más empezar no deja el intento bloqueado', async () => {
    // Arrange
    const throwsAtOnce = vi.fn<Action>(() => {
      throw new Error('falló antes de empezar')
    })
    const retry = succeed()
    const { result } = setup()
    await act(() => result.current.attempt('submitting', throwsAtOnce))

    // Act
    await act(() => result.current.attempt('submitting', retry))

    // Assert
    expect(retry).toHaveBeenCalledOnce()
    expect(result.current.status).toBe('idle')
  })

  it('si la acción recuerda su éxito, repetirla ya terminada no la ejecuta otra vez', async () => {
    // Arrange
    const action = succeed()
    const { result } = setupWithSuccess()
    await act(() => result.current.attempt('submitting', action))

    // Act
    await act(() => result.current.attempt('submitting', action))

    // Assert
    expect(action).toHaveBeenCalledOnce()
    expect(result.current.status).toBe('sent')
  })

  it('tras reset, que avisa de que los datos cambiaron, vuelve a ejecutarse', async () => {
    // Arrange
    const action = succeed()
    const { result } = setupWithSuccess()
    await act(() => result.current.attempt('submitting', action))

    // Act
    act(() => result.current.reset())
    await act(() => result.current.attempt('submitting', action))

    // Assert
    expect(action).toHaveBeenCalledTimes(2)
  })

  it('reset no interrumpe una acción en curso ni la reactiva', async () => {
    // Arrange
    const { promise, finish } = deferred()
    const action = vi.fn<Action>(() => promise)
    const { result } = setupWithSuccess()
    let attempt: Promise<void> = Promise.resolve()
    act(() => {
      attempt = result.current.attempt('submitting', action)
    })

    // Act
    act(() => result.current.reset())
    const statusAfterReset = result.current.status
    await act(async () => {
      finish()
      await attempt
    })

    // Assert
    expect(statusAfterReset).toBe('submitting')
    expect(action).toHaveBeenCalledOnce()
  })

  it('si los datos cambiaron durante el envío, lo nuevo se puede enviar después', async () => {
    // Arrange
    const { promise, finish } = deferred()
    const action = vi.fn<Action>(() => promise)
    const { result } = setupWithSuccess()
    let attempt: Promise<void> = Promise.resolve()
    act(() => {
      attempt = result.current.attempt('submitting', action)
    })
    act(() => result.current.reset())
    await act(async () => {
      finish()
      await attempt
    })

    // Act
    await act(() => result.current.attempt('submitting', action))

    // Assert
    expect(action).toHaveBeenCalledTimes(2)
  })
})

describe('useAttempt: clave de la operación', () => {
  const keysOf = (action: ReturnType<typeof succeed>) => action.mock.calls.map(([operationKey]) => operationKey)

  it('entrega a la acción una clave que identifica la operación', async () => {
    // Arrange
    const action = succeed()
    const { result } = setup()

    // Act
    await act(() => result.current.attempt('submitting', action))

    // Assert
    expect(keysOf(action)).toEqual([expect.stringMatching(/\S{8,}/)])
  })

  it('reintentar tras un fallo usa la misma clave: es la misma operación', async () => {
    // Arrange
    const action = fail()
    const { result } = setup()
    await act(() => result.current.attempt('submitting', action))

    // Act
    await act(() => result.current.attempt('submitting', action))

    // Assert
    const [first, second] = keysOf(action)
    expect(second).toBe(first)
  })

  it('tras reset la clave cambia: con datos distintos es otra operación', async () => {
    // Arrange
    const action = fail()
    const { result } = setup()
    await act(() => result.current.attempt('submitting', action))

    // Act
    act(() => result.current.reset())
    await act(() => result.current.attempt('submitting', action))

    // Assert
    const [first, second] = keysOf(action)
    expect(second).not.toBe(first)
  })

  it('dos formularios distintos no comparten clave', async () => {
    // Arrange
    const action = succeed()
    const one = setup()
    const other = setup()

    // Act
    await act(() => one.result.current.attempt('submitting', action))
    await act(() => other.result.current.attempt('submitting', action))

    // Assert
    const [first, second] = keysOf(action)
    expect(second).not.toBe(first)
  })
})
