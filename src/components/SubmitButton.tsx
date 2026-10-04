import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import BusyButton from '@/components/BusyButton'
import { cn } from '@/lib/utils'

interface SubmitButtonProps {
  isSubmitting: boolean
  icon: LucideIcon
  /** Texto mientras dura el envío, p. ej. "Enviando…". */
  submittingLabel: string
  children: ReactNode
  className?: string
}

/** Botón de envío de un formulario: mientras envía se desactiva para evitar envíos duplicados. */
const SubmitButton = ({ isSubmitting, icon, submittingLabel, children, className }: SubmitButtonProps) => {
  return (
    <BusyButton
      type="submit"
      size="lg"
      isBusy={isSubmitting}
      icon={icon}
      busyLabel={submittingLabel}
      className={cn('h-11 text-base', className)}
    >
      {children}
    </BusyButton>
  )
}

export default SubmitButton
