import type { PlanPrice } from '@/features/shop/types/plan.types'
import { formatPrice } from '@/shared/utils/format'

export interface PlanPriceLabel {
  /** Texto principal: "Gratis", "$ 50", "Próximamente". */
  amount: string
  /** Texto que antecede al importe, p. ej. "Desde". */
  prefix?: string
  /** Texto que sigue al importe, p. ej. "/ mes". */
  suffix?: string
}

export const formatPlanPrice = (price: PlanPrice): PlanPriceLabel => {
  switch (price.kind) {
    case 'free':
      return { amount: 'Gratis' }
    case 'monthly':
      return { prefix: 'Desde', amount: formatPrice(price.from), suffix: '/ mes' }
    case 'upcoming':
      return { amount: 'Próximamente' }
  }
}
