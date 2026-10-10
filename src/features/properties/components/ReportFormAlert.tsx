import { CircleAlert, CircleCheck, Info } from 'lucide-react'
import StatusAlert from '@/components/StatusAlert'
import type { StatusAlertContent } from '@/components/StatusAlert'
import type { ReportFormStatus } from '@/features/properties/types/report.types'
import { CONTACT } from '@/shared/constants/contact'

/** Los estados sin entrada (en reposo, enviando) no muestran nada. */
const ALERTS: Partial<Record<ReportFormStatus, StatusAlertContent>> = {
  sent: {
    icon: CircleCheck,
    title: 'Recibimos tu reporte',
    description: 'Gracias por avisarnos. Revisaremos esta publicación.',
    role: 'status',
  },
  unavailable: {
    icon: Info,
    title: 'Los reportes aún no están disponibles',
    description: `No se envió tu reporte. Mientras tanto, llámanos al ${CONTACT.phone.display}.`,
  },
  throttled: {
    icon: Info,
    title: 'Ya recibimos muchos reportes',
    description: 'No se envió el tuyo: llegaron demasiados en poco tiempo. Inténtalo de nuevo en una hora.',
  },
  failed: {
    icon: CircleAlert,
    title: 'No pudimos enviar tu reporte',
    description: `Inténtalo de nuevo o llámanos al ${CONTACT.phone.display}.`,
    variant: 'destructive',
  },
}

interface ReportFormAlertProps {
  status: ReportFormStatus
}

/** Resultado de reportar la publicación. Nunca se confirma un reporte que no salió. */
const ReportFormAlert = ({ status }: ReportFormAlertProps) => {
  const content = ALERTS[status]

  return content ? <StatusAlert {...content} /> : null
}

export default ReportFormAlert
