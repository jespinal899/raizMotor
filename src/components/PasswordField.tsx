import type { ComponentProps, ReactNode } from 'react'
import FormField from '@/components/FormField'
import PasswordInput from '@/components/PasswordInput'
import { cn } from '@/lib/utils'

type InputProps = Omit<
  ComponentProps<typeof PasswordInput>,
  'id' | 'value' | 'onChange' | 'aria-invalid' | 'aria-describedby'
>

interface PasswordFieldProps extends InputProps {
  label: string
  /** Regla que debe cumplir, p. ej. "mínimo 8 caracteres". */
  hint?: string
  /** Enlace a la derecha de la etiqueta, p. ej. el de recuperar la contraseña. */
  labelAction?: ReactNode
  error?: string
  value: string
  /** Recibe el texto escrito, no el evento. */
  onChange: (value: string) => void
}

/** Campo de contraseña con su etiqueta y su error, del mismo alto que `TextField`. */
const PasswordField = ({
  label,
  hint,
  labelAction,
  error,
  onChange,
  className,
  ...inputProps
}: PasswordFieldProps) => {
  return (
    <FormField label={label} hint={hint} labelAction={labelAction} error={error}>
      {(control) => (
        <PasswordInput
          {...inputProps}
          {...control}
          onChange={(event) => onChange(event.target.value)}
          className={cn('h-11', className)}
        />
      )}
    </FormField>
  )
}

export default PasswordField
