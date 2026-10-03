import { useCallback, useEffect, useRef, useState } from 'react'
import type { FocusEvent, PointerEvent } from 'react'

const SWIPE_THRESHOLD_PX = 50

export const useCarousel = (count: number) => {
  const [index, setIndex] = useState(0)
  const [hovered, setHovered] = useState(false)
  const [keyboardFocused, setKeyboardFocused] = useState(false)
  const rootRef = useRef<HTMLElement>(null)
  const swipeStart = useRef<{ x: number; y: number } | null>(null)

  const goTo = useCallback((target: number) => setIndex(((target % count) + count) % count), [count])
  const next = useCallback(() => setIndex((current) => (current + 1) % count), [count])
  const prev = useCallback(() => setIndex((current) => (current - 1 + count) % count), [count])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
      // Las flechas no deben mover el carrusel mientras el foco está en otro control (menú, formularios).
      const focused = document.activeElement
      const focusIsElsewhere =
        focused !== null && focused !== document.body && !rootRef.current?.contains(focused)
      if (focusIsElsewhere) return

      if (event.key === 'ArrowRight') next()
      if (event.key === 'ArrowLeft') prev()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [next, prev])

  const rootProps = {
    ref: rootRef,
    // Solo el ratón pausa: en pantallas táctiles un toque dejaría el carrusel detenido.
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
    onPointerDown: (event: PointerEvent<HTMLElement>) => {
      if (event.pointerType === 'mouse') return
      swipeStart.current = { x: event.clientX, y: event.clientY }
    },
    onPointerUp: (event: PointerEvent<HTMLElement>) => {
      const start = swipeStart.current
      swipeStart.current = null
      if (!start) return

      const deltaX = event.clientX - start.x
      const deltaY = event.clientY - start.y
      if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX || Math.abs(deltaX) < Math.abs(deltaY)) return

      if (deltaX < 0) next()
      else prev()
    },
    onPointerCancel: () => {
      swipeStart.current = null
    },
  }

  return { index, paused: hovered || keyboardFocused, goTo, next, prev, rootProps }
}
