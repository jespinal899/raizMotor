import type { ReactNode } from 'react'
import type { StepDirection } from '@/hooks/useSteps'
import { cn } from '@/lib/utils'

/** La pantalla nueva entra desde el lado hacia el que se avanza. */
const SLIDE_IN: Record<StepDirection, string> = {
  forward: 'animate-slide-in-right',
  backward: 'animate-slide-in-left',
}

const focusOnMount = (element: HTMLElement | null) => element?.focus()

interface StepScreenProps {
  /** El título de la pantalla, p. ej. "Paso 2 de 3: Pago". */
  heading: string
  direction: StepDirection
  /**
   * Si se llega desde otra pantalla. Al cargar la página no se toca el foco; al cambiar de pantalla va a
   * su título, para anunciarla y subir hasta él, y la pantalla entra deslizándose.
   */
  isEntering: boolean
  children: ReactNode
}

/**
 * Una pantalla de un formulario por pasos. Quien la usa le da como `key` la posición de la pantalla: así
 * cada una se monta de nuevo, se repite la animación y su título recibe el foco.
 */
const StepScreen = ({ heading, direction, isEntering, children }: StepScreenProps) => {
  return (
    // Marco de la pantalla: recorta lo que asoma mientras entra deslizándose, para que no ensanche la página
    // en móviles. El margen negativo deja sitio al anillo de foco de los campos.
    <div className="-mx-1 overflow-x-clip px-1">
      <div className={cn('grid gap-6', isEntering && SLIDE_IN[direction])}>
        <h2
          ref={isEntering ? focusOnMount : undefined}
          tabIndex={-1}
          className="scroll-mt-24 font-heading text-2xl font-semibold tracking-tight outline-none"
        >
          {heading}
        </h2>
        {children}
      </div>
    </div>
  )
}

export default StepScreen
