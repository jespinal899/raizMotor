import { useEffect, useEffectEvent } from 'react'
import type { RefObject } from 'react'

interface ArrowKeyHandlers {
  onLeft: () => void
  onRight: () => void
}

const hasModifier = (event: KeyboardEvent) => event.altKey || event.ctrlKey || event.metaKey || event.shiftKey

/**
 * Escucha las flechas izquierda/derecha en toda la página, salvo cuando el foco está en un
 * control ajeno a `scopeRef` (menú, formularios), para no robarle las teclas.
 */
export const useArrowKeys = (scopeRef: RefObject<HTMLElement | null>, { onLeft, onRight }: ArrowKeyHandlers) => {
  const handleKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (hasModifier(event)) return

    const focused = document.activeElement
    const focusIsElsewhere =
      focused !== null && focused !== document.body && !scopeRef.current?.contains(focused)
    if (focusIsElsewhere) return

    if (event.key === 'ArrowRight') onRight()
    if (event.key === 'ArrowLeft') onLeft()
  })

  useEffect(() => {
    const listener = (event: KeyboardEvent) => handleKeyDown(event)
    window.addEventListener('keydown', listener)
    return () => window.removeEventListener('keydown', listener)
  }, [])
}
