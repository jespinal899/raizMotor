import type { ReactNode } from 'react'
import ButtonLink from '@/components/ButtonLink'
import { Card } from '@/components/ui/card'
import type { PlanAction } from '@/features/shop/types/plan.types'

interface PlanCardProps {
  name: string
  action: PlanAction
  /** Lo que va entre el nombre y el botón: el texto del plan, o lo que incluye y su precio. */
  children: ReactNode
}

const PlanCard = ({ name, action, children }: PlanCardProps) => {
  return (
    <Card className="h-full gap-6 p-6">
      <h2 className="font-heading text-xl font-semibold">{name}</h2>
      {children}
      {/* El botón queda abajo aunque las tarjetas de la fila tengan textos de distinto largo. */}
      <ButtonLink to={action.to} size="lg" className="mt-auto h-11 text-base">
        {action.label}
      </ButtonLink>
    </Card>
  )
}

export default PlanCard
