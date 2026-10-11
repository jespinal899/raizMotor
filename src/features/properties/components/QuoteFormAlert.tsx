import { CircleAlert, CircleCheck, Info, ShieldAlert } from 'lucide-react'
import StatusAlert from '@/components/StatusAlert'
import type { StatusAlertContent } from '@/components/StatusAlert'
import type { QuoteFormStatus } from '@/features/properties/types/quote.types'
import { CONTACT } from '@/shared/constants/contact'

/** Los estados sin entrada (en reposo, enviando) no muestran nada. */
const ALERTS: Partial<Record<QuoteFormStatus, StatusAlertContent>> = {
  sent: {
    icon: CircleCheck,
    title: 'Le enviamos tus datos al publicador',
    description: 'Te escribirá o te llamará directamente. Revisa también tu correo no deseado.',
    role: 'status',
  },
  unavailable: {
    icon: Info,
    title: 'El contacto por correo aún no está disponible',
    description: `No se enviaron tus datos. Mientras tanto, llámanos al ${CONTACT.phone.display}.`,
  },
  throttled: {
    icon: Info,
    title: 'Ya se enviaron muchos contactos',
    description: 'No se enviaron tus datos: llegaron demasiados en poco tiempo. Inténtalo de nuevo en una hora.',
  },
  captcha: {
    icon: ShieldAlert,
    title: 'No pudimos comprobar que no eres un robot',
    description: 'Si aparece una casilla encima del botón, márcala. Si no, vuelve a intentarlo en unos segundos.',
    variant: 'destructive',
  },
  failed: {
    icon: CircleAlert,
    title: 'No pudimos enviar tus datos',
    description: `Inténtalo de nuevo o llámanos al ${CONTACT.phone.display}.`,
    variant: 'destructive',
  },
}

interface QuoteFormAlertProps {
  status: QuoteFormStatus
}

/** Resultado de enviar los datos al publicador. Nunca confirma un envío que no salió. */
const QuoteFormAlert = ({ status }: QuoteFormAlertProps) => {
  const content = ALERTS[status]

  return content ? <StatusAlert {...content} /> : null
}

export default QuoteFormAlert
