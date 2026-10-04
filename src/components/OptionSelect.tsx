import type { ComponentProps } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { SelectOption } from '@/shared/types/common.types'

type TriggerProps = Pick<
  ComponentProps<typeof SelectTrigger>,
  'id' | 'aria-labelledby' | 'aria-invalid' | 'aria-describedby'
>

interface OptionSelectProps {
  options: SelectOption[]
  /** Cadena vacía cuando aún no se eligió nada. */
  value: string
  onChange: (value: string) => void
  /** Texto que se muestra mientras no hay nada elegido. */
  placeholder?: string
  disabled?: boolean
  /** Enlazan el botón del desplegable con su etiqueta y su error. */
  triggerProps?: TriggerProps
}

/** Desplegable de una lista de opciones. La etiqueta la pone quien lo usa. */
const OptionSelect = ({ options, value, onChange, placeholder, disabled, triggerProps }: OptionSelectProps) => {
  return (
    <Select
      items={options}
      value={value === '' ? null : value}
      disabled={disabled}
      onValueChange={(selected) => {
        if (selected !== null) onChange(selected)
      }}
    >
      <SelectTrigger {...triggerProps} className="w-full data-[size=default]:h-11">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export default OptionSelect
