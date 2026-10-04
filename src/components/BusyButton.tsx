import type { ComponentProps } from 'react'
import { LoaderCircle } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

type BusyButtonProps = Omit<ComponentProps<typeof Button>, 'disabled'> & {
  isBusy: boolean
  icon: LucideIcon
  /** Texto mientras dura el trabajo, p. ej. "Buscando…". */
  busyLabel: string
}

/** Botón de una acción que tarda: mientras trabaja se desactiva, para que no se repita, y lo indica. */
const BusyButton = ({ isBusy, icon: Icon, busyLabel, children, type = 'button', ...buttonProps }: BusyButtonProps) => {
  return (
    <Button type={type} disabled={isBusy} {...buttonProps}>
      {isBusy ? <LoaderCircle className="animate-spin" /> : <Icon />}
      {isBusy ? busyLabel : children}
    </Button>
  )
}

export default BusyButton
