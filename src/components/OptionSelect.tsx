import type { ComponentProps } from 'react'
import { ChevronDownIcon } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useIsTouchScreen } from '@/hooks/useIsTouchScreen'
import { cn } from '@/lib/utils'
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

/**
 * La lista del propio teléfono: en un iPhone o un Android abre el selector del sistema, grande y hecho para el
 * dedo. Su letra es de 16 px para que el iPhone no amplíe la página al tocarla.
 */
const NativeSelect = ({ options, value, onChange, placeholder, disabled, triggerProps }: OptionSelectProps) => (
  <div className="relative w-full">
    <select
      {...triggerProps}
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      className={cn(
        'h-11 w-full appearance-none rounded-lg border border-input bg-transparent py-2 pr-9 pl-2.5 text-base outline-none',
        'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50',
        'aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30',
        value === '' && 'text-muted-foreground',
      )}
    >
      {/* Mientras no se elige nada se lee el texto de ayuda, que no se puede elegir. */}
      {value === '' && (
        <option value="" disabled>
          {placeholder ?? ''}
        </option>
      )}
      {options.map((option) => (
        <option key={option.value} value={option.value} className="text-foreground">
          {option.label}
        </option>
      ))}
    </select>
    <ChevronDownIcon
      aria-hidden="true"
      className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
    />
  </div>
)

/**
 * Desplegable de una lista de opciones. La etiqueta la pone quien lo usa. Con ratón, un menú con el diseño del
 * sitio; en una pantalla táctil, la lista del propio teléfono.
 */
const OptionSelect = (props: OptionSelectProps) => {
  const isTouchScreen = useIsTouchScreen()
  if (isTouchScreen) return <NativeSelect {...props} />

  const { options, value, onChange, placeholder, disabled, triggerProps } = props

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
