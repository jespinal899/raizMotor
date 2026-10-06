import { CircleAlert, CircleCheck, Info } from 'lucide-react'
import StatusAlert from '@/components/StatusAlert'
import type { StatusAlertContent } from '@/components/StatusAlert'
import type { QuoteFormStatus } from '@/features/properties/types/quote.types'
import { CONTACT } from '@/shared/constants/contact'

/** Los estados sin entrada (en reposo, enviando) no muestran nada. */
const ALERTS: Partial<Record<QuoteFormStatus, StatusAlertContent>> = {
  sent: {
    icon: CircleCheck,
    title: 'Recibimos tu solicitud',
    description: 'Te contactaremos pronto con la cotización de esta propiedad.',
    role: 'status',
  },
  unavailable: {
    icon: Info,
    title: 'Las cotizaciones aún no están disponibles',
    description: `No se envió tu solicitud. Mientras tanto, llámanos al ${CONTACT.phone.display}.`,
  },
  failed: {
    icon: CircleAlert,
    title: 'No pudimos enviar tu solicitud',
    description: `Inténtalo de nuevo o llámanos al ${CONTACT.phone.display}.`,
    variant: 'destructive',
  },
}

interface QuoteFormAlertProps {
  status: QuoteFormStatus
}

/** Resultado de pedir la cotización. Nunca se confirma una solicitud que no salió. */
const QuoteFormAlert = ({ status }: QuoteFormAlertProps) => {
  const content = ALERTS[status]

  return content ? <StatusAlert {...content} /> : null
}

export default QuoteFormAlert
