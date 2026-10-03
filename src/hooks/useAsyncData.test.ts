import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useAsyncData } from '@/hooks/useAsyncData'

const createDeferred = <T>() => {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((onResolve) => {
    resolve = onResolve
  })
  return { promise, resolve }
}

describe('useAsyncData', () => {
  it('empieza cargando y sin datos', () => {
    // Arrange
    const load = () => new Promise<string>(() => {})

    // Act
    const { result } = renderHook(() => useAsyncData(load, 'clave'))

    // Assert
    expect(result.current).toEqual({ data: undefined, isLoading: true, error: undefined })
  })

  it('entrega los datos cuando la carga termina', async () => {
    // Arrange
    const load = () => Promise.resolve('listo')

    // Act
    const { result } = renderHook(() => useAsyncData(load, 'clave'))

    // Assert
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.data).toBe('listo')
    expect(result.current.error).toBeUndefined()
  })

  it('expone el error cuando la carga falla', async () => {
    // Arrange
    const load = () => Promise.reject(new Error('sin conexión'))

    // Act
    const { result } = renderHook(() => useAsyncData(load, 'clave'))

    // Assert
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.error?.message).toBe('sin conexión')
    expect(result.current.data).toBeUndefined()
  })

  it('convierte en Error un rechazo que no lo es', async () => {
    // Arrange
    const load = () => Promise.reject('fallo en texto')

    // Act
    const { result } = renderHook(() => useAsyncData(load, 'clave'))

    // Assert
    await waitFor(() => expect(result.current.error).toBeInstanceOf(Error))
    expect(result.current.error?.message).toBe('fallo en texto')
  })

  it('no vuelve a cargar si la clave no cambia', async () => {
    // Arrange
    const load = vi.fn(() => Promise.resolve('dato'))
    const { result, rerender } = renderHook(() => useAsyncData(load, 'clave'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    // Act
    rerender()

    // Assert
    expect(load).toHaveBeenCalledTimes(1)
  })

  it('vuelve a cargar y marca cargando cuando cambia la clave', async () => {
    // Arrange
    const load = vi.fn((key: string) => Promise.resolve(`dato de ${key}`))
    const { result, rerender } = renderHook(({ key }) => useAsyncData(() => load(key), key), {
      initialProps: { key: 'a' },
    })
    await waitFor(() => expect(result.current.data).toBe('dato de a'))

    // Act
    rerender({ key: 'b' })

    // Assert
    expect(result.current.isLoading).toBe(true)
    await waitFor(() => expect(result.current.data).toBe('dato de b'))
  })

  it('descarta una respuesta que llega tarde de una clave anterior', async () => {
    // Arrange
    const slow = createDeferred<string>()
    const fast = createDeferred<string>()
    const responses: Record<string, Promise<string>> = { lenta: slow.promise, rapida: fast.promise }
    const { result, rerender } = renderHook(({ key }) => useAsyncData(() => responses[key], key), {
      initialProps: { key: 'lenta' },
    })

    // Act
    rerender({ key: 'rapida' })
    fast.resolve('respuesta nueva')
    await waitFor(() => expect(result.current.data).toBe('respuesta nueva'))
    slow.resolve('respuesta vieja')
    await slow.promise

    // Assert
    expect(result.current.data).toBe('respuesta nueva')
  })
})
