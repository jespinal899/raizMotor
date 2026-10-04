import { useId } from 'react'
import type { ReactNode } from 'react'
import { Label } from '@/components/ui/label'

/** Atributos que el control debe recibir para quedar enlazado con su etiqueta y su error. */
export interface FormControlProps {
  id: string
  'aria-invalid': boolean
  'aria-describedby': string | undefined
}

interface FormFieldProps {
  label: string
  /** Aclaración junto a la etiqueta, p. ej. "Opcional". */
  hint?: string
  error?: string
  children: (control: FormControlProps) => ReactNode
}

const FormField = ({ label, hint, error, children }: FormFieldProps) => {
  const id = useId()
  const errorId = `${id}-error`

  return (
    <div className="grid content-start gap-2">
      <Label htmlFor={id}>
        {label}
        {hint && (
          <>
            {' '}
            <span className="font-normal text-muted-foreground">({hint})</span>
          </>
        )}
      </Label>
      {children({ id, 'aria-invalid': Boolean(error), 'aria-describedby': error ? errorId : undefined })}
      {error && (
        <p id={errorId} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}

export default FormField
