import type { ComponentProps, ComponentType } from 'react'
import { LoaderCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

type BusyButtonProps = ComponentProps<typeof Button> & {
  isBusy: boolean
  /** Icono en reposo: uno de lucide o cualquier otro dibujo, como el logotipo de un servicio. */
  icon: ComponentType<{ className?: string }>
  /** Texto mientras dura el trabajo, p. ej. "Buscando…". */
  busyLabel: string
}

/**
 * Botón de una acción que tarda: mientras trabaja se desactiva, para que no se repita, y lo indica.
 * También puede desactivarse desde fuera, por ejemplo mientras otra acción está en curso.
 */
const BusyButton = ({
  isBusy,
  icon: Icon,
  busyLabel,
  children,
  type = 'button',
  disabled = false,
  ...buttonProps
}: BusyButtonProps) => {
  return (
    <Button type={type} disabled={isBusy || disabled} {...buttonProps}>
      {isBusy ? <LoaderCircle className="animate-spin" /> : <Icon />}
      {isBusy ? busyLabel : children}
    </Button>
  )
}

export default BusyButton
