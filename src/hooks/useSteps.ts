import { useState } from 'react'

/** Hacia dónde fue el último cambio de paso; sirve para animar la entrada del nuevo. */
export type StepDirection = 'forward' | 'backward'

interface StepPosition {
  current: number
  direction: StepDirection
}

/** Recorrido por una serie de pasos numerados desde 0, sin salirse de sus límites. */
export const useSteps = (total: number) => {
  const [{ current, direction }, setPosition] = useState<StepPosition>({ current: 0, direction: 'forward' })
  const lastStep = total - 1

  const goTo = (step: number) => {
    setPosition((position) => {
      const target = Math.min(Math.max(step, 0), lastStep)
      if (target === position.current) return position

      return { current: target, direction: target > position.current ? 'forward' : 'backward' }
    })
  }

  return {
    current,
    direction,
    isFirst: current === 0,
    isLast: current === lastStep,
    next: () => goTo(current + 1),
    back: () => goTo(current - 1),
    goTo,
  }
}
