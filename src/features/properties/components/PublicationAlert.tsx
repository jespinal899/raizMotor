import { CircleAlert, CircleCheck, Info } from 'lucide-react'
import StatusAlert from '@/components/StatusAlert'
import type { StatusAlertContent } from '@/components/StatusAlert'
import type { PublicationStatus } from '@/features/properties/types/publication.types'
import { BRAND } from '@/shared/constants/brand'

/** Los estados sin entrada (en reposo, enviando) no muestran nada. */
const ALERTS: Partial<Record<PublicationStatus, StatusAlertContent>> = {
  published: {
    icon: CircleCheck,
    title: 'Tu propiedad se publicó',
    description: `Ya aparece en el catálogo de ${BRAND.name}.`,
    role: 'status',
  },
  unavailable: {
    icon: Info,
    title: 'La publicación aún no está disponible',
    description: `Estamos preparando las cuentas de ${BRAND.name} para que puedas publicar. Tu anuncio no se envió; si quieres anunciar ya, contáctanos.`,
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
