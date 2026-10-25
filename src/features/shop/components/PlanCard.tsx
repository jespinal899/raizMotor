import type { ReactNode } from 'react'
import ButtonLink from '@/components/ButtonLink'
import { Card } from '@/components/ui/card'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { ACCOUNTS_AVAILABLE } from '@/features/auth/services/authService'
import type { PlanAction } from '@/features/shop/types/plan.types'
import { cn } from '@/lib/utils'
import { loginPath } from '@/shared/constants/routes'

interface PlanCardProps {
  name: string
  action: PlanAction
  /** Pone el nombre en el color de la marca y eleva el botón al pasar el cursor. */
  accented?: boolean
  /** Lo que va entre el nombre y el botón: el texto del plan, o lo que incluye y su precio. */
  children: ReactNode
}

const PlanCard = ({ name, action, accented = false, children }: PlanCardProps) => {
  const { status } = useAuth()
  const ActionIcon = action.icon
  // Sin sesión, elegir el plan lleva a iniciarla y, al entrar, al paso que se eligió. Mientras se sabe si hay
  // sesión el botón va al paso mismo: esa página también la pide.
  const to =
    action.requiresAccount && ACCOUNTS_AVAILABLE && status === 'signedOut' ? loginPath(action.to) : action.to

  return (
    <Card className="h-full gap-6 p-6">
      <h2 className={cn('font-heading text-xl font-semibold', accented && 'text-primary')}>{name}</h2>
      {children}
      {/* El botón queda abajo aunque las tarjetas de la fila tengan textos de distinto largo. */}
      <ButtonLink
        to={to}
        variant="default"
        size="lg"
        className={cn(
          'mt-auto h-11 text-base',
          accented && 'hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary/20',
        )}
      >
        {ActionIcon && <ActionIcon aria-hidden="true" className="size-4" strokeWidth={1.75} />}
        {action.label}
      </ButtonLink>
    </Card>
  )
}

export default PlanCard
