import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useIsPageZoomed } from '@/hooks/useIsPageZoomed'

/** La vista del navegador, que es quien sabe cuánto se amplió la página con dos dedos. */
const stubViewport = (scale: number) => {
  const viewport = Object.assign(new EventTarget(), { scale })
  vi.stubGlobal('visualViewport', viewport)

  return {
    zoomTo: (next: number) => {
      viewport.scale = next
      viewport.dispatchEvent(new Event('resize'))
    },
  }
}

describe('useIsPageZoomed', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('con la página a su tamaño, no está ampliada', () => {
    // Arrange
    stubViewport(1)

    // Act
    const { result } = renderHook(() => useIsPageZoomed())

    // Assert
    expect(result.current).toBe(false)
  })

  it('se entera cuando se amplía con dos dedos', () => {
    // Arrange
    const viewport = stubViewport(1)
    const { result } = renderHook(() => useIsPageZoomed())

    // Act
    act(() => viewport.zoomTo(2.5))

    // Assert
    expect(result.current).toBe(true)
  })

  it('y cuando vuelve a su tamaño', () => {
    // Arrange
    const viewport = stubViewport(2.5)
    const { result } = renderHook(() => useIsPageZoomed())

    // Act
    act(() => viewport.zoomTo(1))

    // Assert
    expect(result.current).toBe(false)
  })

  it('en un navegador que no lo dice, da por hecho que no está ampliada', () => {
    // Arrange
    vi.stubGlobal('visualViewport', undefined)

    // Act
    const { result } = renderHook(() => useIsPageZoomed())

    // Assert
    expect(result.current).toBe(false)
  })
})
