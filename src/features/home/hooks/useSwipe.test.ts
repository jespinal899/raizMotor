import type { PointerEvent } from 'react'
import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useSwipe } from '@/features/home/hooks/useSwipe'

const pointer = (pointerType: string, clientX: number, clientY = 0) =>
  ({ pointerType, clientX, clientY }) as PointerEvent<HTMLElement>

const setup = () => {
  const onSwipeLeft = vi.fn()
  const onSwipeRight = vi.fn()
  const { result } = renderHook(() => useSwipe({ onSwipeLeft, onSwipeRight }))
  return { handlers: result.current, onSwipeLeft, onSwipeRight }
}

describe('useSwipe', () => {
  it('avisa de un deslizamiento hacia la izquierda', () => {
    // Arrange
    const { handlers, onSwipeLeft, onSwipeRight } = setup()

    // Act
    handlers.onPointerDown(pointer('touch', 300))
    handlers.onPointerUp(pointer('touch', 100))

    // Assert
    expect(onSwipeLeft).toHaveBeenCalledOnce()
    expect(onSwipeRight).not.toHaveBeenCalled()
  })

  it('avisa de un deslizamiento hacia la derecha', () => {
    // Arrange
    const { handlers, onSwipeLeft, onSwipeRight } = setup()

    // Act
    handlers.onPointerDown(pointer('touch', 100))
    handlers.onPointerUp(pointer('touch', 300))

    // Assert
    expect(onSwipeRight).toHaveBeenCalledOnce()
    expect(onSwipeLeft).not.toHaveBeenCalled()
  })

  it('ignora un movimiento más corto que el umbral', () => {
    // Arrange
    const { handlers, onSwipeLeft, onSwipeRight } = setup()

    // Act
    handlers.onPointerDown(pointer('touch', 200))
    handlers.onPointerUp(pointer('touch', 170))

    // Assert
    expect(onSwipeLeft).not.toHaveBeenCalled()
    expect(onSwipeRight).not.toHaveBeenCalled()
  })

  it('ignora un movimiento principalmente vertical', () => {
    // Arrange
    const { handlers, onSwipeLeft } = setup()

    // Act
    handlers.onPointerDown(pointer('touch', 300, 100))
    handlers.onPointerUp(pointer('touch', 240, 400))

    // Assert
    expect(onSwipeLeft).not.toHaveBeenCalled()
  })

  it('ignora el arrastre con el ratón', () => {
    // Arrange
    const { handlers, onSwipeLeft } = setup()

    // Act
    handlers.onPointerDown(pointer('mouse', 300))
    handlers.onPointerUp(pointer('mouse', 100))

    // Assert
    expect(onSwipeLeft).not.toHaveBeenCalled()
  })

  it('descarta el gesto cuando el navegador lo cancela', () => {
    // Arrange
    const { handlers, onSwipeLeft } = setup()

    // Act
    handlers.onPointerDown(pointer('touch', 300))
    handlers.onPointerCancel()
    handlers.onPointerUp(pointer('touch', 100))

    // Assert
    expect(onSwipeLeft).not.toHaveBeenCalled()
  })
})
