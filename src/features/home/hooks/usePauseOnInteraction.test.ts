import type { FocusEvent, PointerEvent } from 'react'
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { usePauseOnInteraction } from '@/features/home/hooks/usePauseOnInteraction'

const pointer = (pointerType: string) => ({ pointerType }) as PointerEvent<HTMLElement>

const focusOn = (focusVisible: boolean) =>
  ({ target: { matches: () => focusVisible } }) as unknown as FocusEvent<HTMLElement>

const blurTo = (staysInside: boolean) =>
  ({ currentTarget: { contains: () => staysInside }, relatedTarget: null }) as unknown as FocusEvent<HTMLElement>

describe('usePauseOnInteraction', () => {
  it('no está en pausa al inicio', () => {
    // Arrange: sin ninguna interacción previa

    // Act
    const { result } = renderHook(() => usePauseOnInteraction())

    // Assert
    expect(result.current.paused).toBe(false)
  })

  it('pausa mientras el ratón está encima y reanuda al salir', () => {
    // Arrange
    const { result } = renderHook(() => usePauseOnInteraction())

    // Act
    act(() => result.current.handlers.onPointerEnter(pointer('mouse')))
    const pausedWhileHovering = result.current.paused
    act(() => result.current.handlers.onPointerLeave(pointer('mouse')))

    // Assert
    expect(pausedWhileHovering).toBe(true)
    expect(result.current.paused).toBe(false)
  })

  it('no pausa con un toque en pantalla táctil', () => {
    // Arrange
    const { result } = renderHook(() => usePauseOnInteraction())

    // Act
    act(() => result.current.handlers.onPointerEnter(pointer('touch')))

    // Assert
    expect(result.current.paused).toBe(false)
  })

  it('pausa cuando el foco llega por teclado', () => {
    // Arrange
    const { result } = renderHook(() => usePauseOnInteraction())

    // Act
    act(() => result.current.handlers.onFocus(focusOn(true)))

    // Assert
    expect(result.current.paused).toBe(true)
  })

  it('no pausa cuando el foco llega por un clic', () => {
    // Arrange
    const { result } = renderHook(() => usePauseOnInteraction())

    // Act
    act(() => result.current.handlers.onFocus(focusOn(false)))

    // Assert
    expect(result.current.paused).toBe(false)
  })

  it('sigue en pausa si el foco se mueve a otro control interno', () => {
    // Arrange
    const { result } = renderHook(() => usePauseOnInteraction())
    act(() => result.current.handlers.onFocus(focusOn(true)))

    // Act
    act(() => result.current.handlers.onBlur(blurTo(true)))

    // Assert
    expect(result.current.paused).toBe(true)
  })

  it('reanuda cuando el foco sale por completo', () => {
    // Arrange
    const { result } = renderHook(() => usePauseOnInteraction())
    act(() => result.current.handlers.onFocus(focusOn(true)))

    // Act
    act(() => result.current.handlers.onBlur(blurTo(false)))

    // Assert
    expect(result.current.paused).toBe(false)
  })
})
