import { useRef } from 'react'
import { useArrowKeys } from '@/features/home/hooks/useArrowKeys'
import { useAutoplay } from '@/features/home/hooks/useAutoplay'
import { useCarouselIndex } from '@/features/home/hooks/useCarouselIndex'
import { usePauseOnInteraction } from '@/features/home/hooks/usePauseOnInteraction'
import { useSwipe } from '@/features/home/hooks/useSwipe'

interface CarouselOptions {
  count: number
  autoplayMs: number
}

/** Reúne navegación, autoplay, teclado, gestos y pausa en la API que consume el carrusel. */
export const useCarousel = ({ count, autoplayMs }: CarouselOptions) => {
  const rootRef = useRef<HTMLElement>(null)
  const { index, goTo, next, prev } = useCarouselIndex(count)
  const { paused, handlers: pauseHandlers } = usePauseOnInteraction()
  const swipeHandlers = useSwipe({ onSwipeLeft: next, onSwipeRight: prev })

  useAutoplay({ durationMs: autoplayMs, paused, cycleKey: index, onComplete: next })
  useArrowKeys(rootRef, { onLeft: prev, onRight: next })

  return {
    index,
    paused,
    goTo,
    next,
    prev,
    rootProps: { ref: rootRef, ...pauseHandlers, ...swipeHandlers },
  }
}
