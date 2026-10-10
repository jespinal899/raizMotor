import { useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import TextField from '@/components/TextField'
import { Button } from '@/components/ui/button'
import ModerationActionButton from '@/features/admin/components/ModerationActionButton'
import { PLAN_LIMITS } from '@/features/admin/data/adminLabels.data'
import type { AdminAccount, AdminService } from '@/features/admin/types/admin.types'
import { fullName } from '@/features/admin/utils/accountLabels'

const MAX_LIMIT = 1000

interface AccountLimitActionProps {
  account: AdminAccount
  service: AdminService
  onDone: () => void
}

/** Cambia cuántos anuncios puede tener publicados una cuenta: lo que se hace al activar un plan contratado. */
const AccountLimitAction = ({ account, service, onDone }: AccountLimitActionProps) => {
  const [typed, setTyped] = useState(String(account.maxPublications))
  const limit = Number(typed)
  const isValid = typed.trim() !== '' && Number.isInteger(limit) && limit >= 0 && limit <= MAX_LIMIT

  return (
    <ModerationActionButton
      label="Cambiar límite"
      icon={SlidersHorizontal}
      title="Cambiar el límite de anuncios"
      description={`${fullName(account)} (${account.email}) puede tener ${account.maxPublications} publicados a la vez y hoy tiene ${account.publishedCount}. Si baja el límite, sus anuncios siguen publicados, pero no podrá publicar más hasta quedar por debajo.`}
      busyLabel="Guardando…"
      canConfirm={isValid}
      onConfirm={(note) => service.setPublicationLimit(account.id, limit, note)}
      onDone={onDone}
    >
      <div className="grid gap-3">
        <div role="group" aria-label="Límites de los planes" className="flex flex-wrap gap-2">
          {PLAN_LIMITS.map((plan) => (
            <Button
              key={plan.label}
              type="button"
              variant={limit === plan.limit ? 'default' : 'outline'}
              aria-pressed={limit === plan.limit}
              onClick={() => setTyped(String(plan.limit))}
            >
              {plan.label} ({plan.limit})
            </Button>
          ))}
        </div>
        <TextField
          label="Anuncios publicados a la vez"
          type="number"
          inputMode="numeric"
          min={0}
          max={MAX_LIMIT}
          step={1}
          value={typed}
          onChange={setTyped}
          error={isValid ? undefined : `Escribe un número entero de 0 a ${MAX_LIMIT}.`}
        />
      </div>
    </ModerationActionButton>
  )
}

export default AccountLimitAction
