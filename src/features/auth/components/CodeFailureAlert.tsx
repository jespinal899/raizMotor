import { CircleAlert } from 'lucide-react'
import StatusAlert from '@/components/StatusAlert'
import type { StatusAlertContent } from '@/components/StatusAlert'
import type { CodeFailure } from '@/features/auth/types/auth.types'

const FAILURES: Record<CodeFailure, StatusAlertContent> = {
  invalidCode: {
    icon: CircleAlert,
    title: 'El código no es correcto o ya venció',
    description: 'Revisa que sea el del último correo que te enviamos. Vence a los 15 minutos: si pasó más tiempo, pide otro.',
    variant: 'destructive',
  },
  failed: {
    icon: CircleAlert,
    title: 'Algo salió mal',
    description: 'Inténtalo de nuevo en unos minutos.',
    variant: 'destructive',
  },
}

/** Por qué no se pudo usar el código. Los estados sin fallo no muestran nada. */
const CodeFailureAlert = ({ status }: { status: string }) =>
  Object.hasOwn(FAILURES, status) ? <StatusAlert {...FAILURES[status as CodeFailure]} /> : null

export default CodeFailureAlert
