import { CircleAlert, CircleCheck } from 'lucide-react'
import StatusAlert from '@/components/StatusAlert'
import type { StatusAlertContent } from '@/components/StatusAlert'
import type { PublicationStatus } from '@/features/properties/types/publication.types'

/** Los estados sin entrada (en reposo, enviando) no muestran nada. */
const ALERTS: Partial<Record<PublicationStatus, StatusAlertContent>> = {
  published: {
    icon: CircleCheck,
    title: 'Tu propiedad se publicó',
    description: 'Ya aparece en tu catálogo local.',
    role: 'status',
  },
  failed: {
    icon: CircleAlert,
    title: 'No pudimos publicar tu propiedad',
    description: 'Tu anuncio no se envió. Inténtalo de nuevo en unos minutos.',
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
