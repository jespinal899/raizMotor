import type { ComponentProps, ReactNode } from 'react'
import BusyButton from '@/components/BusyButton'
import { cn } from '@/lib/utils'

interface SubmitButtonProps {
  isSubmitting: boolean
  icon: ComponentProps<typeof BusyButton>['icon']
  /** Texto mientras dura el envío, p. ej. "Enviando…". */
  submittingLabel: string
  /** Para desactivarlo mientras otra acción del mismo formulario está en curso. */
  disabled?: boolean
  children: ReactNode
  className?: string
}

/** Botón de envío de un formulario: mientras envía se desactiva para evitar envíos duplicados. */
const SubmitButton = ({ isSubmitting, icon, submittingLabel, disabled, children, className }: SubmitButtonProps) => {
  return (
    <BusyButton
      type="submit"
      size="lg"
      isBusy={isSubmitting}
      disabled={disabled}
      icon={icon}
      busyLabel={submittingLabel}
      className={cn('h-11 text-base', className)}
    >
      {children}
    </BusyButton>
  )
}

export default SubmitButton
