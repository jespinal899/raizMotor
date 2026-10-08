import { useState } from 'react'

type CouponStatus = 'idle' | 'empty' | 'invalid'

/** Los estados sin entrada no muestran nada. */
const MESSAGES: Partial<Record<CouponStatus, string>> = {
  empty: 'Escribe el código de descuento.',
  invalid: 'Ese código de descuento no es válido.',
}

/**
 * El espacio para un código de descuento. Todavía no existen códigos, así que ninguno es válido: lo
 * escrito no se guarda, no se envía a ningún sitio y no cambia el total.
 */
export const useCouponCode = () => {
  const [code, setCode] = useState('')
  const [status, setStatus] = useState<CouponStatus>('idle')

  const change = (text: string) => {
    setCode(text)
    setStatus('idle')
  }

  const apply = () => setStatus(code.trim() ? 'invalid' : 'empty')

  return { code, error: MESSAGES[status], change, apply }
}
