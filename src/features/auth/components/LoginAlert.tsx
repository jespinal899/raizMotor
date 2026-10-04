import { CircleAlert, Info } from 'lucide-react'
import StatusAlert from '@/components/StatusAlert'
import type { StatusAlertContent } from '@/components/StatusAlert'
import type { LoginStatus } from '@/features/auth/types/auth.types'
import { BRAND } from '@/shared/constants/brand'

/** Los estados sin entrada (en reposo, enviando) no muestran nada. */
const ALERTS: Partial<Record<LoginStatus, StatusAlertContent>> = {
  unavailable: {
    icon: Info,
    title: 'El inicio de sesión aún no está disponible',
    description: `Estamos preparando las cuentas de ${BRAND.name}. Si necesitas ayuda, contáctanos.`,
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

interface LoginAlertProps {
  status: LoginStatus
}

/** Por qué no se pudo entrar. */
const LoginAlert = ({ status }: LoginAlertProps) => {
  const content = ALERTS[status]

  return content ? <StatusAlert {...content} /> : null
}

export default LoginAlert
