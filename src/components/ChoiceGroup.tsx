import type { LucideIcon } from 'lucide-react'
import FormGroup from '@/components/FormGroup'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'

export interface ChoiceOption<Value extends string> {
  value: Value
  label: string
  icon?: LucideIcon
}

interface ChoiceGroupProps<Value extends string> {
  label: string
  options: ChoiceOption<Value>[]
  /** Cadena vacía cuando aún no se eligió nada. */
  value: Value | ''
  onChange: (value: Value) => void
  error?: string
  /** Para cambiar la disposición de las opciones, p. ej. `grid-cols-1` cuando son frases. */
  className?: string
}

/** Pocas opciones excluyentes, todas a la vista como tarjetas. */
const ChoiceGroup = <Value extends string>({
  label,
  options,
  value,
  onChange,
  error,
  className,
}: ChoiceGroupProps<Value>) => {
  const choose = (selected: unknown) => {
    const chosen = options.find((option) => option.value === selected)
    if (chosen) onChange(chosen.value)
  }

  return (
    <FormGroup label={label} error={error}>
      {(group) => (
        <RadioGroup
          {...group}
          value={value}
          onValueChange={choose}
          className={cn('grid-cols-[repeat(auto-fit,minmax(8.5rem,1fr))]', className)}
        >
          {options.map(({ value: optionValue, label: optionLabel, icon: Icon }) => (
            <Label
              key={optionValue}
              className="cursor-pointer rounded-lg border p-3 font-normal transition-colors hover:bg-muted/50 has-data-checked:border-primary has-data-checked:bg-primary/5 has-focus-visible:ring-3 has-focus-visible:ring-ring/50"
            >
              <RadioGroupItem value={optionValue} />
              {Icon && <Icon className="size-4 text-muted-foreground" aria-hidden="true" />}
              {optionLabel}
            </Label>
          ))}
        </RadioGroup>
      )}
    </FormGroup>
  )
}

export default ChoiceGroup
