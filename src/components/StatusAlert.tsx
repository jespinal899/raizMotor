import type { LucideIcon } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export interface StatusAlertContent {
  icon: LucideIcon
  title: string
  description: string
  variant?: 'default' | 'destructive'
  /** `alert` interrumpe para avisar de un problema; `status` informa sin interrumpir. */
  role?: 'alert' | 'status'
}

/** Resultado de una acción (enviar, entrar, publicar) con título y explicación. */
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
