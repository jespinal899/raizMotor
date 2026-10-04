import { CircleAlert, Info } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import type { LoginStatus } from '@/features/auth/types/auth.types'
import { BRAND } from '@/shared/constants/brand'

type VisibleStatus = Exclude<LoginStatus, 'idle' | 'submitting'>

interface AlertContent {
  icon: LucideIcon
  title: string
  description: string
  variant: 'default' | 'destructive'
}

const ALERTS: Record<VisibleStatus, AlertContent> = {
  unavailable: {
    icon: Info,
    title: 'El inicio de sesión aún no está disponible',
    description: `Estamos preparando las cuentas de ${BRAND.name}. Si necesitas ayuda, contáctanos.`,
    variant: 'default',
  },
  rejected: {
    icon: CircleAlert,
    title: 'No pudimos iniciar tu sesión',
    description: 'El correo o la contraseña no son correctos.',
    variant: 'destructive',
  },
  failed: {
    icon: CircleAlert,
    title: 'Algo salió mal',
    description: 'No pudimos iniciar tu sesión. Inténtalo de nuevo en unos minutos.',
    variant: 'destructive',
  },
}

const isVisible = (status: LoginStatus): status is VisibleStatus => Object.hasOwn(ALERTS, status)

interface LoginAlertProps {
  status: LoginStatus
}

/** Por qué no se pudo entrar. Mientras no hay resultado, no muestra nada. */
const LoginAlert = ({ status }: LoginAlertProps) => {
  if (!isVisible(status)) return null

  const { icon: Icon, title, description, variant } = ALERTS[status]

  return (
    <Alert variant={variant}>
      <Icon aria-hidden="true" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  )
}

export default LoginAlert
