import type { ReactNode } from 'react'
import { LoaderCircle } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
const SubmitButton = ({ isSubmitting, icon: Icon, submittingLabel, children, className }: SubmitButtonProps) => {
  return (
    <Button type="submit" size="lg" disabled={isSubmitting} className={cn('h-11 text-base', className)}>
      {isSubmitting ? <LoaderCircle className="animate-spin" /> : <Icon />}
      {isSubmitting ? submittingLabel : children}
    </Button>
  )
}

export default SubmitButton
