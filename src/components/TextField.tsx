import type { ComponentProps } from 'react'
import FormField from '@/components/FormField'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type InputProps = Omit<ComponentProps<typeof Input>, 'id' | 'value' | 'onChange' | 'aria-invalid' | 'aria-describedby'>

interface TextFieldProps extends InputProps {
  label: string
  hint?: string
  error?: string
  value: string
  /** Recibe el texto escrito, no el evento. */
  onChange: (value: string) => void
}

/** Campo de una línea con su etiqueta y su error. Vale también para números (`type="number"`). */
const TextField = ({ label, hint, error, onChange, className, ...inputProps }: TextFieldProps) => {
  return (
    <FormField label={label} hint={hint} error={error}>
      {(control) => (
        <Input
          {...inputProps}
          {...control}
          onChange={(event) => onChange(event.target.value)}
          className={cn('h-11', className)}
        />
      )}
    </FormField>
  )
}

export default TextField
