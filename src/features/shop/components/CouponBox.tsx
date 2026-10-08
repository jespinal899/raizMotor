import { useState } from 'react'
import type { KeyboardEvent } from 'react'
import CheckboxField from '@/components/CheckboxField'
import TextField from '@/components/TextField'
import { Button } from '@/components/ui/button'
import { useCouponCode } from '@/features/shop/hooks/useCouponCode'

/** El campo del código y su botón. Vive solo mientras la casilla está marcada: al desmarcarla se olvida lo escrito. */
const CouponCodeField = () => {
  const { code, error, change, apply } = useCouponCode()

  // Va dentro del formulario de contratación: Intro aplica el código en lugar de enviar la solicitud.
  const applyOnEnter = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return

    event.preventDefault()
    apply()
  }

  return (
    <div className="grid gap-3">
      <TextField
        label="Código de descuento"
        error={error}
        autoComplete="off"
        value={code}
        onChange={change}
        onKeyDown={applyOnEnter}
      />
      <Button type="button" variant="outline" size="lg" onClick={apply} className="h-11 text-base">
        Aplicar
      </Button>
    </div>
  )
}

/** Pregunta si se tiene un código de descuento y, si es así, da dónde escribirlo. */
const CouponBox = () => {
  const [hasCode, setHasCode] = useState(false)

  return (
    <div className="grid gap-3">
      <CheckboxField label="¿Tienes un código de descuento?" checked={hasCode} onChange={setHasCode} />
      {hasCode && <CouponCodeField />}
    </div>
  )
}

export default CouponBox
