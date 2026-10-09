import { useRef, useState } from 'react'
import type { PointerEvent } from 'react'

/** Recorrido mínimo, en píxeles, para que un arrastre cuente como deslizar y no como un toque. */
export const SWIPE_DISTANCE = 50

export type SwipeDirection = 'left' | 'right'

/** Hacia dónde se deslizó, o `null` si fue un toque, un arrastre corto o un gesto más vertical que horizontal. */
export const toSwipeDirection = (deltaX: number, deltaY: number): SwipeDirection | null => {
  if (Math.abs(deltaX) < SWIPE_DISTANCE || Math.abs(deltaX) <= Math.abs(deltaY)) return null

  return deltaX < 0 ? 'left' : 'right'
}

interface SwipeOptions {
  /** Se llama al soltar, si el gesto fue un deslizamiento hacia un lado. */
  onSwipe: (direction: SwipeDirection) => void
  /** Sin él no se responde a ningún arrastre, p. ej. cuando no hay a dónde pasar. */
  enabled?: boolean
}

/** Los controles que hay sobre la superficie siguen siendo suyos: arrastrar desde uno no desliza. */
const CONTROLS = 'button, a, input, select, textarea'

/**
 * Deslizar a izquierda o derecha sobre un elemento, con el dedo o arrastrando con el ratón. Mientras dura
 * el arrastre entrega su recorrido (`offset`), para que lo que se desliza pueda acompañar al dedo.
 *
 * Quien lo use debe dar al elemento `touch-action: pan-y pinch-zoom`: sin eso, en una pantalla táctil el
 * navegador se queda con el gesto horizontal y lo interrumpe.
 */
export const useSwipe = ({ onSwipe, enabled = true }: SwipeOptions) => {
  const start = useRef<{ x: number; y: number } | null>(null)
  const [offset, setOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const stop = () => {
    start.current = null
    setOffset(0)
    setIsDragging(false)
  }

  const onPointerDown = (event: PointerEvent) => {
    // Un segundo dedo es ampliar la foto, no deslizarla: el gesto que había se abandona.
    if (!event.isPrimary) return stop()
    if (event.button !== 0 || (event.target as Element).closest(CONTROLS)) return

    start.current = { x: event.clientX, y: event.clientY }
    setIsDragging(true)
  }

  const onPointerMove = (event: PointerEvent) => {
    if (!start.current || !event.isPrimary) return
    // El ratón se soltó fuera de la ventana y aquí no llegó el aviso: sin esto, al volver seguiría arrastrando.
    if (event.pointerType === 'mouse' && event.buttons === 0) return stop()

    setOffset(event.clientX - start.current.x)
  }

  const onPointerUp = (event: PointerEvent) => {
    if (!start.current || !event.isPrimary) return

    const direction = toSwipeDirection(event.clientX - start.current.x, event.clientY - start.current.y)
    stop()
    if (direction) onSwipe(direction)
  }

  return {
    offset,
    isDragging,
    // `onPointerCancel`: el navegador se quedó con el gesto, por ejemplo para desplazar la página.
    handlers: enabled ? { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: stop } : {},
  }
}
