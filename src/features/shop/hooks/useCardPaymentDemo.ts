import { useState } from 'react'
import type { CardDemoValues } from '@/features/shop/utils/cardDemo'
import {
  formatCardExpiry,
  formatCardNumber,
  formatSecurityCode,
  validateCardDemo,
} from '@/features/shop/utils/cardDemo'
import { useFormFields } from '@/hooks/useFormFields'

const EMPTY_CARD: CardDemoValues = { number: '', expiry: '', securityCode: '', holder: '' }

/** Cómo se escribe cada dato de la tarjeta mientras se teclea. El nombre del titular va tal cual. */
const FORMATTERS: Partial<Record<keyof CardDemoValues, (text: string) => string>> = {
  number: formatCardNumber,
  expiry: formatCardExpiry,
  securityCode: formatSecurityCode,
}

type CardPaymentDemo = ReturnType<typeof useCardPaymentDemo>

/** Lo que necesita la pantalla de pago de demostración. */
export type CardDemoFieldsProps = Pick<CardPaymentDemo, 'values' | 'errors' | 'change'>

/**
 * La pantalla de pago con tarjeta de demostración: muestra el diseño y nada más. No cobra, no guarda lo
 * escrito y no lo envía a ningún sitio.
 */
export const useCardPaymentDemo = () => {
  const {
    values,
    errors,
    change: changeField,
    validateFields,
  } = useFormFields({ initialValues: EMPTY_CARD, validate: validateCardDemo })
  const [isPaid, setIsPaid] = useState(false)

  const change = (field: keyof CardDemoValues, text: string) => {
    changeField(field, FORMATTERS[field]?.(text) ?? text)
  }

  /** Pasa a la confirmación de muestra si los datos tienen la forma correcta, y dice si lo hizo. */
  const pay = (): boolean => {
    const isValid = validateFields()
    if (isValid) setIsPaid(true)

    return isValid
  }

  return { values, errors, isPaid, change, pay }
}
