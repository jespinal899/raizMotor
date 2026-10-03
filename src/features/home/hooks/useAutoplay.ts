import { useEffect, useEffectEvent, useRef } from 'react'

interface AutoplayOptions {
  durationMs: number
  paused: boolean
  /** Cambia en cada ciclo; reinicia la cuenta atrás. */
  cycleKey: number
  onComplete: () => void
}

/** Llama a `onComplete` tras `durationMs`; al pausar conserva el tiempo restante y lo retoma al reanudar. */
export const useAutoplay = ({ durationMs, paused, cycleKey, onComplete }: AutoplayOptions) => {
  const remainingMs = useRef(durationMs)
  const complete = useEffectEvent(onComplete)

  useEffect(() => {
    remainingMs.current = durationMs
  }, [cycleKey, durationMs])

  useEffect(() => {
    if (paused) return

    const startedAt = Date.now()
    const timer = setTimeout(complete, remainingMs.current)

    return () => {
      clearTimeout(timer)
      remainingMs.current = Math.max(0, remainingMs.current - (Date.now() - startedAt))
    }
  }, [paused, cycleKey, durationMs])
}
