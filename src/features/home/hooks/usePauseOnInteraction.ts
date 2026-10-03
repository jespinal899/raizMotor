import { useState } from 'react'
import type { FocusEvent, PointerEvent } from 'react'

/** Indica si el usuario está interactuando: ratón encima o foco de teclado dentro. */
export const usePauseOnInteraction = () => {
  const [hovered, setHovered] = useState(false)
  const [keyboardFocused, setKeyboardFocused] = useState(false)

  const handlers = {
    // Solo el ratón pausa: en pantallas táctiles un toque dejaría el contenido detenido.
    onPointerEnter: (event: PointerEvent<HTMLElement>) => {
      if (event.pointerType === 'mouse') setHovered(true)
    },
    onPointerLeave: (event: PointerEvent<HTMLElement>) => {
      if (event.pointerType === 'mouse') setHovered(false)
    },
    onFocus: (event: FocusEvent<HTMLElement>) => {
      setKeyboardFocused(event.target.matches(':focus-visible'))
    },
    onBlur: (event: FocusEvent<HTMLElement>) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setKeyboardFocused(false)
    },
  }

  return { paused: hovered || keyboardFocused, handlers }
}
