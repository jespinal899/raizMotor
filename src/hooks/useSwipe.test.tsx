import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SWIPE_DISTANCE, toSwipeDirection, useSwipe } from '@/hooks/useSwipe'
import type { SwipeDirection } from '@/hooks/useSwipe'

interface ProbeProps {
  onSwipe: (direction: SwipeDirection) => void
  enabled?: boolean
}

/** Una superficie que se puede deslizar, con un botón dentro, y lo que el gesto lleva recorrido. */
const Probe = ({ onSwipe, enabled }: ProbeProps) => {
  const { offset, isDragging, handlers } = useSwipe({ onSwipe, enabled })

  return (
    <div data-testid="superficie" {...handlers}>
      <output>{`${isDragging ? 'arrastrando' : 'en reposo'}: ${offset}`}</output>
      <button type="button">Un control</button>
    </div>
  )
}

const setup = (enabled?: boolean) => {
  const onSwipe = vi.fn()
  render(<Probe onSwipe={onSwipe} enabled={enabled} />)

  return { onSwipe, surface: screen.getByTestId('superficie') }
}

const START = { clientX: 300, clientY: 200 }
/** Como el dedo o el botón principal del ratón: el único con el que se desliza. */
const POINTER = { isPrimary: true, button: 0, pointerId: 1 }

const press = (target: Element) => fireEvent.pointerDown(target, { ...POINTER, ...START })
const moveBy = (target: Element, x: number, y = 0) =>
  fireEvent.pointerMove(target, { ...POINTER, clientX: START.clientX + x, clientY: START.clientY + y })
const releaseAt = (target: Element, x: number, y = 0) =>
  fireEvent.pointerUp(target, { ...POINTER, clientX: START.clientX + x, clientY: START.clientY + y })

const drag = (target: Element, x: number, y = 0) => {
  press(target)
  moveBy(target, x, y)
  releaseAt(target, x, y)
}

describe('toSwipeDirection', () => {
  it.each([
    { when: 'un arrastre largo hacia la izquierda', delta: [-SWIPE_DISTANCE, 0], expected: 'left' },
    { when: 'un arrastre largo hacia la derecha', delta: [SWIPE_DISTANCE, 0], expected: 'right' },
    { when: 'un arrastre que no llega al mínimo', delta: [SWIPE_DISTANCE - 1, 0], expected: null },
    { when: 'un toque, sin recorrido', delta: [0, 0], expected: null },
    { when: 'un gesto más vertical que horizontal', delta: [-SWIPE_DISTANCE, SWIPE_DISTANCE + 10], expected: null },
    { when: 'un gesto en diagonal, pero más horizontal', delta: [-SWIPE_DISTANCE * 2, SWIPE_DISTANCE], expected: 'left' },
  ])('$when es $expected', ({ delta, expected }) => {
    // Arrange
    const [deltaX, deltaY] = delta

    // Act
    const direction = toSwipeDirection(deltaX, deltaY)

    // Assert
    expect(direction).toBe(expected)
  })
})

describe('useSwipe', () => {
  it.each([
    { distance: -120, direction: 'left' },
    { distance: 120, direction: 'right' },
  ])('avisa de que se deslizó hacia $direction al soltar', ({ distance, direction }) => {
    // Arrange
    const { onSwipe, surface } = setup()

    // Act
    drag(surface, distance)

    // Assert
    expect(onSwipe).toHaveBeenCalledExactlyOnceWith(direction)
  })

  it('un toque o un arrastre corto no cuentan como deslizar', () => {
    // Arrange
    const { onSwipe, surface } = setup()

    // Act
    drag(surface, 0)
    drag(surface, SWIPE_DISTANCE - 10)

    // Assert
    expect(onSwipe).not.toHaveBeenCalled()
  })

  it('mientras se arrastra dice cuánto lleva recorrido, y al soltar vuelve a cero', () => {
    // Arrange
    const { surface } = setup()
    press(surface)

    // Act
    moveBy(surface, -80)
    const whileDragging = screen.getByRole('status').textContent
    releaseAt(surface, -80)

    // Assert
    expect(whileDragging).toBe('arrastrando: -80')
    expect(screen.getByRole('status')).toHaveTextContent('en reposo: 0')
  })

  it('un arrastre que empieza en un botón es del botón: no desliza', () => {
    // Arrange
    const { onSwipe } = setup()

    // Act
    drag(screen.getByRole('button', { name: 'Un control' }), -120)

    // Assert
    expect(onSwipe).not.toHaveBeenCalled()
  })

  it('si el navegador interrumpe el gesto, no desliza y deja de arrastrar', () => {
    // Arrange
    const { onSwipe, surface } = setup()
    press(surface)
    moveBy(surface, -120)

    // Act
    fireEvent.pointerCancel(surface, POINTER)

    // Assert
    expect(onSwipe).not.toHaveBeenCalled()
    expect(screen.getByRole('status')).toHaveTextContent('en reposo: 0')
  })

  it('si el ratón se soltó fuera de la ventana, al volver ya no arrastra', () => {
    // Arrange
    const { onSwipe, surface } = setup()
    press(surface)
    moveBy(surface, -120)

    // Act
    fireEvent.pointerMove(surface, { ...POINTER, pointerType: 'mouse', buttons: 0, clientX: 100, clientY: 200 })

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent('en reposo: 0')
    expect(onSwipe).not.toHaveBeenCalled()
  })

  it('con dos dedos, que es ampliar la foto, no desliza', () => {
    // Arrange
    const { onSwipe, surface } = setup()
    press(surface)

    // Act
    fireEvent.pointerDown(surface, { isPrimary: false, button: 0, pointerId: 2, clientX: 350, clientY: 200 })
    moveBy(surface, -120)
    releaseAt(surface, -120)

    // Assert
    expect(onSwipe).not.toHaveBeenCalled()
  })

  it('desactivado no responde a ningún arrastre', () => {
    // Arrange
    const { onSwipe, surface } = setup(false)

    // Act
    drag(surface, -120)

    // Assert
    expect(onSwipe).not.toHaveBeenCalled()
  })
})
