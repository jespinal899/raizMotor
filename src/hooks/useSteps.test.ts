import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useSteps } from '@/hooks/useSteps'

const TOTAL = 3

const setup = () => renderHook(() => useSteps(TOTAL))

describe('useSteps', () => {
  it('empieza en el primer paso', () => {
    // Arrange: recorrido recién abierto

    // Act
    const { result } = setup()

    // Assert
    expect(result.current.current).toBe(0)
    expect(result.current.isFirst).toBe(true)
    expect(result.current.isLast).toBe(false)
  })

  it('avanza al paso siguiente, hacia delante', () => {
    // Arrange
    const { result } = setup()

    // Act
    act(() => result.current.next())

    // Assert
    expect(result.current.current).toBe(1)
    expect(result.current.direction).toBe('forward')
    expect(result.current.isFirst).toBe(false)
  })

  it('reconoce el último paso y no avanza más allá de él', () => {
    // Arrange
    const { result } = setup()
    act(() => result.current.next())
    act(() => result.current.next())

    // Act
    act(() => result.current.next())

    // Assert
    expect(result.current.current).toBe(2)
    expect(result.current.isLast).toBe(true)
  })

  it('vuelve al paso anterior, hacia atrás', () => {
    // Arrange
    const { result } = setup()
    act(() => result.current.next())

    // Act
    act(() => result.current.back())

    // Assert
    expect(result.current.current).toBe(0)
    expect(result.current.direction).toBe('backward')
  })

  it('no retrocede antes del primer paso', () => {
    // Arrange
    const { result } = setup()

    // Act
    act(() => result.current.back())

    // Assert
    expect(result.current.current).toBe(0)
  })

  it('salta a un paso concreto, indicando hacia dónde se movió', () => {
    // Arrange
    const { result } = setup()
    act(() => result.current.goTo(2))

    // Act
    act(() => result.current.goTo(0))

    // Assert
    expect(result.current.current).toBe(0)
    expect(result.current.direction).toBe('backward')
  })

  it('al empezar todavía no hubo ningún cambio de paso', () => {
    // Arrange: recorrido recién abierto

    // Act
    const { result } = setup()

    // Assert
    expect(result.current.hasMoved).toBe(false)
  })

  it('recuerda que ya se cambió de paso, aunque después se vuelva al primero', () => {
    // Arrange
    const { result } = setup()
    act(() => result.current.next())

    // Act
    act(() => result.current.back())

    // Assert
    expect(result.current.current).toBe(0)
    expect(result.current.hasMoved).toBe(true)
  })

  it('pedir el paso en el que ya se está no cuenta como cambio', () => {
    // Arrange
    const { result } = setup()

    // Act
    act(() => result.current.goTo(0))

    // Assert
    expect(result.current.hasMoved).toBe(false)
  })
})
