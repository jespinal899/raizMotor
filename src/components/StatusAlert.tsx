import type { LucideIcon } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export interface StatusAlertContent {
  icon: LucideIcon
  title: string
  description: string
  variant?: 'default' | 'destructive'
  /**
   * `alert` interrumpe para avisar de un problema y `status` informa sin interrumpir. `note` no es un
   * resultado: es una advertencia que ya está en la página antes de que la persona haga nada.
   */
  role?: 'alert' | 'status' | 'note'
}

/** Aviso con título y explicación: el resultado de una acción (enviar, entrar, publicar) o una nota previa. */
const StatusAlert = ({ icon: Icon, title, description, variant = 'default', role = 'alert' }: StatusAlertContent) => {
  return (
    <Alert variant={variant} role={role}>
      <Icon aria-hidden="true" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  )
}

export default StatusAlert
