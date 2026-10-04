import { useId } from 'react'
import type { ReactNode } from 'react'
import FieldCaption from '@/components/FieldCaption'
import FieldError from '@/components/FieldError'
import { Label } from '@/components/ui/label'

/** Atributos que el grupo debe recibir para quedar enlazado con su etiqueta y su error. */
export interface FormGroupControlProps {
  'aria-labelledby': string
  'aria-invalid': boolean
  'aria-describedby': string | undefined
}

interface FormGroupProps {
  label: string
  hint?: string
  error?: string
  children: (group: FormGroupControlProps) => ReactNode
}

/** Como `FormField`, para lo que no es un único campo: un grupo de opciones, un mapa, una lista de fotos. */
const FormGroup = ({ label, hint, error, children }: FormGroupProps) => {
  const labelId = useId()
  const errorId = `${labelId}-error`

  return (
    <div className="grid content-start gap-2">
      <Label id={labelId}>
        <FieldCaption label={label} hint={hint} />
      </Label>
      {children({
        'aria-labelledby': labelId,
        'aria-invalid': Boolean(error),
        'aria-describedby': error ? errorId : undefined,
      })}
      <FieldError id={errorId} message={error} />
    </div>
  )
}

export default FormGroup
