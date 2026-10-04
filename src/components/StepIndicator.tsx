import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StepIndicatorProps {
  /** Nombre del recorrido para quien no lo ve, p. ej. "Pasos para publicar". */
  label: string
  /** Títulos de los pasos, en orden. */
  steps: string[]
  /** Posición del paso actual, empezando en 0. */
  current: number
}

type StepState = 'done' | 'current' | 'upcoming'

const getState = (position: number, current: number): StepState => {
  if (position < current) return 'done'

  return position === current ? 'current' : 'upcoming'
}

const BADGE_STYLES: Record<StepState, string> = {
  done: 'border-primary bg-primary text-primary-foreground',
  current: 'border-primary bg-background text-primary ring-4 ring-primary/15',
  upcoming: 'border-border bg-background text-muted-foreground',
}

/** Recorrido de un formulario por pasos: cuáles hay, cuáles están hechos y en cuál se está. */
const StepIndicator = ({ label, steps, current }: StepIndicatorProps) => {
  return (
    <nav aria-label={label}>
      <ol className="flex">
        {steps.map((title, position) => {
          const state = getState(position, current)

          return (
            <li
              key={title}
              aria-current={state === 'current' ? 'step' : undefined}
              className={cn(
                'relative flex flex-1 flex-col items-center gap-2 text-center',
                // Línea que une cada paso con el anterior; se colorea al llegar a él.
                'before:absolute before:top-4.5 before:right-1/2 before:h-0.5 before:w-full before:-translate-y-1/2 first:before:hidden',
                state === 'upcoming' ? 'before:bg-border' : 'before:bg-primary',
              )}
            >
              <span
                className={cn(
                  'relative grid size-9 place-items-center rounded-full border-2 text-sm font-semibold transition-colors',
                  BADGE_STYLES[state],
                )}
              >
                {state === 'done' ? <Check className="size-4" aria-hidden="true" /> : position + 1}
              </span>
              <span
                className={cn(
                  'px-1 text-xs font-medium sm:text-sm',
                  state === 'upcoming' ? 'text-muted-foreground' : 'text-foreground',
                )}
              >
                <span className="sr-only">Paso {position + 1}: </span>
                {title}
                {state === 'done' && <span className="sr-only"> (completado)</span>}
              </span>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default StepIndicator
