import { useRef } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useArrowKeys } from '@/features/home/hooks/useArrowKeys'

interface HarnessProps {
  onLeft: () => void
  onRight: () => void
}

const Harness = ({ onLeft, onRight }: HarnessProps) => {
  const scopeRef = useRef<HTMLDivElement>(null)
  useArrowKeys(scopeRef, { onLeft, onRight })

  return (
    <>
      <div ref={scopeRef}>
        <button type="button">Dentro</button>
      </div>
      <input aria-label="Fuera" />
    </>
  )
}

const setup = () => {
  const onLeft = vi.fn()
  const onRight = vi.fn()
  const view = render(<Harness onLeft={onLeft} onRight={onRight} />)
  return { onLeft, onRight, ...view }
}

describe('useArrowKeys', () => {
  it('llama a onRight con la flecha derecha cuando nada tiene el foco', () => {
    // Arrange
    const { onRight, onLeft } = setup()

    // Act
    fireEvent.keyDown(window, { key: 'ArrowRight' })

    // Assert
    expect(onRight).toHaveBeenCalledOnce()
    expect(onLeft).not.toHaveBeenCalled()
  })

  it('llama a onLeft con la flecha izquierda', () => {
    // Arrange
    const { onLeft } = setup()

    // Act
    fireEvent.keyDown(window, { key: 'ArrowLeft' })

    // Assert
    expect(onLeft).toHaveBeenCalledOnce()
  })

  it('responde cuando el foco está dentro del elemento', () => {
    // Arrange
    const { onRight } = setup()
    screen.getByRole('button', { name: 'Dentro' }).focus()

    // Act
    fireEvent.keyDown(window, { key: 'ArrowRight' })

    // Assert
    expect(onRight).toHaveBeenCalledOnce()
  })

  it('no responde cuando el foco está en un control ajeno', () => {
    // Arrange
    const { onRight } = setup()
    screen.getByRole('textbox', { name: 'Fuera' }).focus()

    // Act
    fireEvent.keyDown(window, { key: 'ArrowRight' })

    // Assert
    expect(onRight).not.toHaveBeenCalled()
  })

  it('no responde si se pulsa junto a una tecla modificadora', () => {
    // Arrange
    const { onLeft } = setup()

    // Act
    fireEvent.keyDown(window, { key: 'ArrowLeft', altKey: true })

    // Assert
    expect(onLeft).not.toHaveBeenCalled()
  })

  it('ignora el resto de teclas', () => {
    // Arrange
    const { onLeft, onRight } = setup()

    // Act
    fireEvent.keyDown(window, { key: 'Enter' })

    // Assert
    expect(onLeft).not.toHaveBeenCalled()
    expect(onRight).not.toHaveBeenCalled()
  })

  it('deja de escuchar al desmontarse', () => {
    // Arrange
    const { onRight, unmount } = setup()
    unmount()

    // Act
    fireEvent.keyDown(window, { key: 'ArrowRight' })

    // Assert
    expect(onRight).not.toHaveBeenCalled()
  })
})
