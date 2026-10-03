import { useRef } from 'react'
import type { PointerEvent } from 'react'

const SWIPE_THRESHOLD_PX = 50

interface SwipeHandlers {
  onSwipeLeft: () => void
  onSwipeRight: () => void
}

/** Detecta deslizamientos horizontales táctiles; el ratón se ignora para no interferir con los clics. */
export const useSwipe = ({ onSwipeLeft, onSwipeRight }: SwipeHandlers) => {
  const start = useRef<{ x: number; y: number } | null>(null)

  return {
    onPointerDown: (event: PointerEvent<HTMLElement>) => {
      if (event.pointerType === 'mouse') return
      start.current = { x: event.clientX, y: event.clientY }
    },
    onPointerUp: (event: PointerEvent<HTMLElement>) => {
      const origin = start.current
      start.current = null
      if (!origin) return

      const deltaX = event.clientX - origin.x
      const deltaY = event.clientY - origin.y
      const isHorizontalSwipe = Math.abs(deltaX) >= SWIPE_THRESHOLD_PX && Math.abs(deltaX) > Math.abs(deltaY)
      if (!isHorizontalSwipe) return

      if (deltaX < 0) onSwipeLeft()
      else onSwipeRight()
    },
    onPointerCancel: () => {
      start.current = null
    },
  }
}
