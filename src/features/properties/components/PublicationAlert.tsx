import { CircleAlert, CircleCheck } from 'lucide-react'
import StatusAlert from '@/components/StatusAlert'
import type { StatusAlertContent } from '@/components/StatusAlert'
import type { PublicationStatus } from '@/features/properties/types/publication.types'
import { FREE_LIMIT_REACHED } from '@/features/properties/utils/publicationLimit'

/** Los estados sin entrada (en reposo, enviando) no muestran nada. */
const ALERTS: Partial<Record<PublicationStatus, StatusAlertContent>> = {
  published: {
    icon: CircleCheck,
    title: 'Tu propiedad se guardó',
    description: 'Está en este navegador; otras personas todavía no pueden verla.',
    role: 'status',
  },
  failed: {
    icon: CircleAlert,
    title: 'No pudimos guardar tu propiedad',
    description: 'Revisa que el navegador permita guardar datos de este sitio y vuelve a intentarlo.',
    variant: 'destructive',
  },
  limitReached: {
    icon: CircleAlert,
    title: FREE_LIMIT_REACHED.title,
    description: `${FREE_LIMIT_REACHED.reason}. Este anuncio no se guardó.`,
    variant: 'destructive',
  },
}

interface PublicationAlertProps {
  status: PublicationStatus
}

/** Resultado del intento de publicar. Nunca se confirma un anuncio que no se publicó. */
const PublicationAlert = ({ status }: PublicationAlertProps) => {
  const content = ALERTS[status]

  return content ? <StatusAlert {...content} /> : null
}

export default PublicationAlert
