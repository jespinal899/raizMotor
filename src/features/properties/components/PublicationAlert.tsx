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

/** Solo con los anuncios compartidos: los límites de uso los pone el servidor. */
const RATE_LIMITED: StatusAlertContent = {
  icon: CircleAlert,
  title: 'Hiciste muchos cambios en poco tiempo',
  description:
    'Para proteger el sitio hay un límite de cambios y de fotos por hora. No se guardó nada: vuelve a intentarlo en una o dos horas.',
  variant: 'destructive',
}

/** Con los anuncios compartidos, publicar lleva a la ficha: solo hay que explicar por qué no se pudo. */
const SHARED_ALERTS: Alerts = {
  rateLimited: RATE_LIMITED,
  failed: {
    icon: CircleAlert,
    title: 'No pudimos publicar tu propiedad',
    description: 'Revisa tu conexión y vuelve a intentarlo. Tu anuncio no se publicó.',
    variant: 'destructive',
  },
  limitReached: LIMIT_REACHED,
}

/** Al editar, guardar lleva a la ficha: solo hay que explicar por qué no se pudo. */
const EDITING_ALERTS: Alerts = {
  rateLimited: RATE_LIMITED,
  failed: {
    icon: CircleAlert,
    title: 'No pudimos guardar los cambios',
    description: 'Tu anuncio sigue como estaba. Vuelve a intentarlo en unos minutos.',
    variant: 'destructive',
  },
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
  /** Si se están guardando los cambios de un anuncio que ya existe. */
  editing?: boolean
}

/** Resultado del intento de publicar. Nunca se confirma un anuncio que no se publicó. */
const PublicationAlert = ({ status, shared = ADS_SHARED, editing = false }: PublicationAlertProps) => {
  const alerts = shared ? SHARED_ALERTS : LOCAL_ALERTS
  const content = (editing ? EDITING_ALERTS : alerts)[status]

  return content ? <StatusAlert {...content} /> : null
}

export default PublicationAlert
