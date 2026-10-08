import { CreditCard, Landmark } from 'lucide-react'
import type { ChoiceOption } from '@/components/ChoiceGroup'
import type { PaymentMethod, PaymentMethodId } from '@/features/shop/types/checkout.types'
import { BRAND } from '@/shared/constants/brand'

/** Todavía no hay pagos en línea: en las dos formas, el pago se coordina después por WhatsApp. */
export const PAYMENT_METHODS: Record<PaymentMethodId, PaymentMethod> = {
  tarjeta: {
    label: 'Tarjeta de débito o crédito',
    description: `Te enviamos por WhatsApp un enlace de pago seguro. Los datos de tu tarjeta no pasan por ${BRAND.name}.`,
    icon: CreditCard,
  },
  transferencia: {
    label: 'Transferencia bancaria',
    description: 'Te enviamos por WhatsApp los datos de la cuenta en BAC Credomatic y nos mandas el comprobante.',
    icon: Landmark,
  },
}

/** En el orden en que se ofrecen. */
const OFFERED: PaymentMethodId[] = ['tarjeta', 'transferencia']

export const PAYMENT_METHOD_OPTIONS: ChoiceOption<PaymentMethodId>[] = OFFERED.map((id) => ({
  value: id,
  ...PAYMENT_METHODS[id],
}))
