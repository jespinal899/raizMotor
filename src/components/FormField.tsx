import { useId } from 'react'
import type { ReactNode } from 'react'
import FieldCaption from '@/components/FieldCaption'
import FieldError from '@/components/FieldError'
import { Label } from '@/components/ui/label'

/** Atributos que el control debe recibir para quedar enlazado con su etiqueta y su error. */
export interface FormControlProps {
  id: string
  'aria-invalid': boolean
  'aria-describedby': string | undefined
}

interface FormFieldProps {
  label: string
  /** Aclaración junto a la etiqueta, p. ej. "opcional". */
  hint?: string
  /** Enlace a la derecha de la etiqueta, p. ej. "Olvidé mi contraseña". Va fuera de ella: no cambia el nombre del campo. */
  labelAction?: ReactNode
  error?: string
  children: (control: FormControlProps) => ReactNode
}

const FormField = ({ label, hint, labelAction, error, children }: FormFieldProps) => {
  const id = useId()
  const errorId = `${id}-error`
  const caption = (
    <Label htmlFor={id}>
      <FieldCaption label={label} hint={hint} />
    </Label>
  )

  return (
    <div className="grid content-start gap-2">
      {labelAction ? (
        <div className="flex items-center justify-between gap-3">
          {caption}
          {labelAction}
        </div>
      ) : (
        caption
      )}
      {children({ id, 'aria-invalid': Boolean(error), 'aria-describedby': error ? errorId : undefined })}
      <FieldError id={errorId} message={error} />
    </div>
  )
}

export default FormField
