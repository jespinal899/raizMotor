import { renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useAutoplay } from '@/features/home/hooks/useAutoplay'

const DURATION_MS = 6000

interface Props {
  paused: boolean
  cycleKey: number
}

const setup = (initialProps: Props = { paused: false, cycleKey: 0 }) => {
  const onComplete = vi.fn()
  const view = renderHook(
    ({ paused, cycleKey }: Props) => useAutoplay({ durationMs: DURATION_MS, paused, cycleKey, onComplete }),
    { initialProps },
  )
  return { onComplete, ...view }
}

describe('useAutoplay', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('avisa al cumplirse la duración', () => {
    // Arrange
    const { onComplete } = setup()

    // Act
    vi.advanceTimersByTime(DURATION_MS)

    // Assert
    expect(onComplete).toHaveBeenCalledOnce()
  })

  it('no avisa antes de tiempo', () => {
    // Arrange
    const { onComplete } = setup()

    // Act
    vi.advanceTimersByTime(DURATION_MS - 1)

    // Assert
    expect(onComplete).not.toHaveBeenCalled()
  })

  it('no avisa mientras está en pausa', () => {
    // Arrange
    const { onComplete } = setup({ paused: true, cycleKey: 0 })

    // Act
    vi.advanceTimersByTime(DURATION_MS * 3)

    // Assert
    expect(onComplete).not.toHaveBeenCalled()
  })

  it('al reanudar continúa con el tiempo que quedaba', () => {
    // Arrange
    const { onComplete, rerender } = setup()
    vi.advanceTimersByTime(4000)
    rerender({ paused: true, cycleKey: 0 })
    vi.advanceTimersByTime(60000)

    // Act
    rerender({ paused: false, cycleKey: 0 })
    vi.advanceTimersByTime(1999)
    const calledBeforeRemainingTime = onComplete.mock.calls.length
    vi.advanceTimersByTime(1)

    // Assert
    expect(calledBeforeRemainingTime).toBe(0)
    expect(onComplete).toHaveBeenCalledOnce()
  })

  it('reinicia la cuenta atrás cuando cambia el ciclo', () => {
    // Arrange
    const { onComplete, rerender } = setup()
    vi.advanceTimersByTime(5000)

    // Act
    rerender({ paused: false, cycleKey: 1 })
    vi.advanceTimersByTime(5999)
    const calledBeforeFullDuration = onComplete.mock.calls.length
    vi.advanceTimersByTime(1)

    // Assert
    expect(calledBeforeFullDuration).toBe(0)
    expect(onComplete).toHaveBeenCalledOnce()
  })

  it('un cambio de ciclo durante la pausa deja la duración completa para la reanudación', () => {
    // Arrange
    const { onComplete, rerender } = setup()
    vi.advanceTimersByTime(5000)
    rerender({ paused: true, cycleKey: 0 })
    rerender({ paused: true, cycleKey: 1 })

    // Act
    rerender({ paused: false, cycleKey: 1 })
    vi.advanceTimersByTime(DURATION_MS - 1)
    const calledBeforeFullDuration = onComplete.mock.calls.length
    vi.advanceTimersByTime(1)

    // Assert
    expect(calledBeforeFullDuration).toBe(0)
    expect(onComplete).toHaveBeenCalledOnce()
  })

  it('cancela el aviso al desmontarse', () => {
    // Arrange
    const { onComplete, unmount } = setup()

    // Act
    unmount()
    vi.advanceTimersByTime(DURATION_MS)

    // Assert
    expect(onComplete).not.toHaveBeenCalled()
  })
})
