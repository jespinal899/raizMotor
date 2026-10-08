import { useId } from 'react'
import type { ReactNode } from 'react'
import FieldError from '@/components/FieldError'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface CheckboxFieldProps {
  /** El texto de la casilla. Puede llevar un enlace, p. ej. a lo que se acepta al marcarla. */
  label: ReactNode
  checked: boolean
  error?: string
  name?: string
  /** Para bloquearla mientras el envío está en curso. */
  readOnly?: boolean
  /** Para un texto largo que ocupa varias líneas: les da aire y deja la casilla junto a la primera. */
  multiline?: boolean
  /** Recibe si queda marcada, no el evento. */
  onChange: (checked: boolean) => void
}

/** Casilla con su texto y, si hace falta marcarla para seguir, su error. */
const CheckboxField = ({ label, error, multiline = false, onChange, ...checkboxProps }: CheckboxFieldProps) => {
  const errorId = useId()

  return (
    <div className="grid gap-2">
      {/* `w-fit`: solo la casilla y su texto la marcan, no todo el ancho de la fila. */}
      <Label className={cn('w-fit font-normal', multiline && 'items-start leading-snug')}>
        <Checkbox
          {...checkboxProps}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          onCheckedChange={(isChecked) => onChange(isChecked)}
        />
        {label}
      </Label>
      <FieldError id={errorId} message={error} />
    </div>
  )
}

export default CheckboxField
