import { CircleAlert, CircleCheck } from 'lucide-react'
import StatusAlert from '@/components/StatusAlert'
import type { StatusAlertContent } from '@/components/StatusAlert'
import { ADS_SHARED } from '@/features/properties/services/propertyRepository'
import type { PublicationStatus } from '@/features/properties/types/publication.types'
import { FREE_LIMIT_REACHED } from '@/features/properties/utils/publicationLimit'

type Alerts = Partial<Record<PublicationStatus, StatusAlertContent>>

const LIMIT_REACHED: StatusAlertContent = {
  icon: CircleAlert,
  title: FREE_LIMIT_REACHED.title,
  description: `${FREE_LIMIT_REACHED.reason}. Este anuncio no se guardó.`,
  variant: 'destructive',
}

/** Con los anuncios compartidos, publicar lleva a la ficha: solo hay que explicar por qué no se pudo. */
const SHARED_ALERTS: Alerts = {
  failed: {
    icon: CircleAlert,
    title: 'No pudimos publicar tu propiedad',
    description: 'Revisa tu conexión y vuelve a intentarlo. Tu anuncio no se publicó.',
    variant: 'destructive',
  },
  limitReached: LIMIT_REACHED,
}

/** Los estados sin entrada (en reposo, enviando) no muestran nada. */
const LOCAL_ALERTS: Alerts = {
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
  limitReached: LIMIT_REACHED,
}

interface PublicationAlertProps {
  status: PublicationStatus
  /** Si los anuncios se guardan para todos y no solo en este navegador. */
  shared?: boolean
}

/** Resultado del intento de publicar. Nunca se confirma un anuncio que no se publicó. */
const PublicationAlert = ({ status, shared = ADS_SHARED }: PublicationAlertProps) => {
  const content = (shared ? SHARED_ALERTS : LOCAL_ALERTS)[status]

  return content ? <StatusAlert {...content} /> : null
}

export default PublicationAlert
