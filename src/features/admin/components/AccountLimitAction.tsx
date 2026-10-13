import { useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import TextField from '@/components/TextField'
import { Button } from '@/components/ui/button'
import ModerationActionButton from '@/features/admin/components/ModerationActionButton'
import { PLAN_LIMITS } from '@/features/admin/data/adminLabels.data'
import type { AdminAccount, AdminService } from '@/features/admin/types/admin.types'
import { fullName } from '@/features/admin/utils/accountLabels'

const MAX_LIMIT = 1000

const toLimit = (typed: string) => {
  const limit = Number(typed)

  return typed.trim() !== '' && Number.isInteger(limit) && limit >= 0 && limit <= MAX_LIMIT ? limit : undefined
}

const LIMIT_ERROR = `Escribe un número entero de 0 a ${MAX_LIMIT}.`

interface AccountLimitActionProps {
  account: AdminAccount
  service: AdminService
  onDone: () => void
}

/**
 * Cambia cuántos anuncios y cuántos proyectos puede tener publicados una cuenta: lo que se hace al activar un
 * plan contratado. Cada botón de plan pone sus dos límites.
 */
const AccountLimitAction = ({ account, service, onDone }: AccountLimitActionProps) => {
  const [typedPublications, setTypedPublications] = useState(String(account.maxPublications))
  const [typedProjects, setTypedProjects] = useState(String(account.maxProjects))
  const publications = toLimit(typedPublications)
  const projects = toLimit(typedProjects)

  return (
    <ModerationActionButton
      label="Cambiar límite"
      icon={SlidersHorizontal}
      title="Cambiar el plan de la cuenta"
      description={`${fullName(account)} (${account.email}) puede tener ${account.maxPublications} anuncios y ${account.maxProjects} proyectos publicados a la vez, y hoy tiene ${account.publishedCount} y ${account.projectCount}. Si baja un límite, lo publicado sigue publicado, pero no podrá publicar más hasta quedar por debajo.`}
      busyLabel="Guardando…"
      canConfirm={publications !== undefined && projects !== undefined}
      onConfirm={(note) => service.setAccountLimits(account.id, { publications: publications!, projects: projects! }, note)}
      onDone={onDone}
    >
      <div className="grid gap-3">
        <div role="group" aria-label="Límites de los planes" className="flex flex-wrap gap-2">
          {PLAN_LIMITS.map((plan) => {
            const isCurrent = publications === plan.publications && projects === plan.projects

            return (
              <Button
                key={plan.label}
                type="button"
                variant={isCurrent ? 'default' : 'outline'}
                aria-pressed={isCurrent}
                onClick={() => {
                  setTypedPublications(String(plan.publications))
                  setTypedProjects(String(plan.projects))
                }}
              >
                {plan.label} ({plan.projects > 0 ? `${plan.projects} + ${plan.publications}` : plan.publications})
              </Button>
            )
          })}
        </div>
        <TextField
          label="Anuncios publicados a la vez"
          type="number"
          inputMode="numeric"
          min={0}
          max={MAX_LIMIT}
          step={1}
          value={typedPublications}
          onChange={setTypedPublications}
          error={publications === undefined ? LIMIT_ERROR : undefined}
        />
        <TextField
          label="Proyectos publicados a la vez"
          type="number"
          inputMode="numeric"
          min={0}
          max={MAX_LIMIT}
          step={1}
          value={typedProjects}
          onChange={setTypedProjects}
          error={projects === undefined ? LIMIT_ERROR : undefined}
        />
      </div>
    </ModerationActionButton>
  )
}

export default AccountLimitAction
