import { Plus } from 'lucide-react'
import ButtonLink from '@/components/ButtonLink'
import { Badge } from '@/components/ui/badge'
import { Progress, ProgressLabel, ProgressValue } from '@/components/ui/progress'
import { hasReachedLimit } from '@/features/properties/utils/publicationLimit'
import { toActivePlan } from '@/features/shop/utils/activePlan'
import { ROUTES } from '@/shared/constants/routes'

interface PlanUsageBannerProps {
  /** Publicaciones que la cuenta tiene en el catálogo: las que ocupan su plan. */
  published: number
  /** Las que su plan admite a la vez. */
  limit: number
}

/**
 * El plan de la cuenta y cuánto lleva usado: una barra con las publicaciones activas sobre las que admite.
 * Según quede lugar o no, ofrece publicar otra o ver los planes.
 */
const PlanUsageBanner = ({ published, limit }: PlanUsageBannerProps) => {
  const plan = toActivePlan(limit)
  const isFull = hasReachedLimit(published, limit)

  return (
    <section
      aria-labelledby="plan-activo"
      className="grid gap-5 rounded-2xl border bg-card p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-8 sm:p-6"
    >
      <div className="grid gap-4">
        <div className="grid gap-1">
          <h2 id="plan-activo" className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Tu plan activo
          </h2>
          <p className="flex flex-wrap items-center gap-2 font-heading text-xl font-semibold tracking-tight">
            {plan.name}
            {plan.isFree && <Badge variant="secondary">Gratis</Badge>}
          </p>
        </div>

        {/* La barra nunca pasa de llena, aunque a la cuenta le hayan rebajado el plan; la cuenta sí dice la verdad. */}
        <Progress
          value={Math.min(published, limit)}
          max={Math.max(limit, 1)}
          getAriaValueText={() => `${published} de ${limit}`}
          className="gap-2 **:data-[slot=progress-track]:h-2"
        >
          <ProgressLabel>Publicaciones activas</ProgressLabel>
          <ProgressValue>{() => `${published}/${limit}`}</ProgressValue>
        </Progress>

        <p className="text-sm text-muted-foreground">
          {isFull
            ? 'Tu plan está completo. Para publicar otra, despublica o elimina una, o cambia de plan.'
            : `Puedes publicar ${limit - published} más.`}
        </p>
      </div>

      {isFull ? (
        <ButtonLink to={ROUTES.pricing} variant="outline">
          Ver planes
        </ButtonLink>
      ) : (
        <ButtonLink to={ROUTES.publish}>
          <Plus />
          Publicar una propiedad
        </ButtonLink>
      )}
    </section>
  )
}

export default PlanUsageBanner
