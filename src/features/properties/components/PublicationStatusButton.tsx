import { CircleAlert, Eye, EyeOff } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import BusyButton from '@/components/BusyButton'
import StatusAlert from '@/components/StatusAlert'
import { PublicationLimitError, RateLimitedError } from '@/features/properties/services/publicationErrors'
import { useAttempt } from '@/hooks/useAttempt'

/** Lo que quien publicó un anuncio puede hacer con su lugar en el catálogo. */
export type StatusAction = 'unpublish' | 'republish'

interface Notice {
  title: string
  description: string
}

interface ActionContent {
  icon: LucideIcon
  label: string
  busyLabel: string
  variant: 'default' | 'outline'
  /** Lo que se dice si no se pudo, sin más motivo que un fallo. */
  failed: Notice
}

const ACTIONS: Record<StatusAction, ActionContent> = {
  unpublish: {
    icon: EyeOff,
    label: 'Despublicar',
    busyLabel: 'Despublicando…',
    variant: 'outline',
    failed: {
      title: 'No pudimos despublicarla',
      description: 'Sigue en el catálogo. Inténtalo de nuevo en unos minutos.',
    },
  },
  republish: {
    icon: Eye,
    label: 'Volver a publicar',
    busyLabel: 'Publicando…',
    variant: 'default',
    failed: {
      title: 'No pudimos volver a publicarla',
      description: 'Sigue despublicada. Inténtalo de nuevo en unos minutos.',
    },
  },
}

const PLAN_FULL: Notice = {
  title: 'Tu plan está completo',
  description: 'Para volver a publicarla, despublica o elimina otra, o cambia de plan.',
}

const RATE_LIMITED: Notice = {
  title: 'Hiciste muchos cambios seguidos',
  description: 'Para proteger el sitio hay un límite por hora. No cambió nada: inténtalo de nuevo en una hora.',
}

interface PublicationStatusButtonProps {
  action: StatusAction
  /** Se resuelve cuando el cambio quedó guardado; se rechaza si no se pudo. */
  onAct: () => Promise<void>
}

/**
 * Botón que despublica una publicación propia o la vuelve a publicar. Si no se pudo lo dice debajo, con
 * el motivo cuando es que el plan ya no admite otra. Cuando sí se pudo, quien la listaba la cambia de
 * módulo y este botón desaparece con ella.
 */
const PublicationStatusButton = ({ action, onAct }: PublicationStatusButtonProps) => {
  const { status, attempt } = useAttempt<'working', 'planFull' | 'rateLimited' | 'failed'>({
    toFailure: (reason) => {
      if (reason instanceof PublicationLimitError) return 'planFull'

      return reason instanceof RateLimitedError ? 'rateLimited' : 'failed'
    },
  })
  const { icon, label, busyLabel, variant, failed } = ACTIONS[action]
  const notices: Partial<Record<typeof status, Notice>> = { planFull: PLAN_FULL, rateLimited: RATE_LIMITED, failed }
  const notice = notices[status]

  return (
    <>
      <BusyButton
        variant={variant}
        isBusy={status === 'working'}
        icon={icon}
        busyLabel={busyLabel}
        onClick={() => void attempt('working', onAct)}
      >
        {label}
      </BusyButton>
      {notice && <StatusAlert icon={CircleAlert} {...notice} variant="destructive" />}
    </>
  )
}

export default PublicationStatusButton
