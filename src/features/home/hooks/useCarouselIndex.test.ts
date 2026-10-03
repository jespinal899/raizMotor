import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useCarouselIndex } from '@/features/home/hooks/useCarouselIndex'

const SLIDE_COUNT = 3

describe('useCarouselIndex', () => {
  it('empieza en el primer slide', () => {
    // Arrange
    const count = SLIDE_COUNT

    // Act
    const { result } = renderHook(() => useCarouselIndex(count))

    // Assert
    expect(result.current.index).toBe(0)
  })

  it('next avanza al siguiente slide', () => {
    // Arrange
    const { result } = renderHook(() => useCarouselIndex(SLIDE_COUNT))

    // Act
    act(() => result.current.next())

    // Assert
    expect(result.current.index).toBe(1)
  })

  it('next vuelve al primero después del último', () => {
    // Arrange
    const { result } = renderHook(() => useCarouselIndex(SLIDE_COUNT))
    act(() => result.current.goTo(SLIDE_COUNT - 1))

    // Act
    act(() => result.current.next())

    // Assert
    expect(result.current.index).toBe(0)
  })

  it('prev va al último cuando está en el primero', () => {
    // Arrange
    const { result } = renderHook(() => useCarouselIndex(SLIDE_COUNT))

    // Act
    act(() => result.current.prev())

    // Assert
    expect(result.current.index).toBe(SLIDE_COUNT - 1)
  })

  it('goTo salta directamente al slide indicado', () => {
    // Arrange
    const { result } = renderHook(() => useCarouselIndex(SLIDE_COUNT))

    // Act
    act(() => result.current.goTo(2))

    // Assert
    expect(result.current.index).toBe(2)
  })

  it('goTo mantiene el índice dentro del rango', () => {
    // Arrange
    const { result } = renderHook(() => useCarouselIndex(SLIDE_COUNT))

    // Act
    act(() => result.current.goTo(7))

    // Assert
    expect(result.current.index).toBe(1)
  })
})
