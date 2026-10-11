import { CircleAlert, Info, ShieldAlert } from 'lucide-react'
import StatusAlert from '@/components/StatusAlert'
import type { StatusAlertContent } from '@/components/StatusAlert'
import type { RegistrationStatus } from '@/features/auth/types/auth.types'
import { BRAND } from '@/shared/constants/brand'

/** Los estados sin entrada (en reposo, enviando, conectando) no muestran nada. */
const ALERTS: Partial<Record<RegistrationStatus, StatusAlertContent>> = {
  unavailable: {
    icon: Info,
    title: 'El registro aún no está disponible',
    description: `Estamos preparando las cuentas de ${BRAND.name}. No se creó ninguna cuenta.`,
  },
  taken: {
    icon: CircleAlert,
    title: 'Ya existe una cuenta con ese correo',
    description: 'Inicia sesión con él o regístrate con otro correo.',
    variant: 'destructive',
  },
  googleUnavailable: {
    icon: Info,
    title: 'El registro con Google aún no está disponible',
    description: 'Por ahora, crea tu cuenta con tu correo.',
  },
  captcha: {
    icon: ShieldAlert,
    title: 'No pudimos comprobar que no eres un robot',
    description: 'Si aparece una casilla encima del botón, márcala. Si no, vuelve a intentarlo en unos segundos.',
    variant: 'destructive',
  },
  failed: {
    icon: CircleAlert,
    title: 'Algo salió mal',
    description: 'No pudimos crear tu cuenta. Inténtalo de nuevo en unos minutos.',
    variant: 'destructive',
  },
}

interface RegisterAlertProps {
  status: RegistrationStatus
}

/** Por qué no se pudo crear la cuenta. */
const RegisterAlert = ({ status }: RegisterAlertProps) => {
  const content = ALERTS[status]

  return content ? <StatusAlert {...content} /> : null
}

export default RegisterAlert
