import { useId } from 'react'
import type { LucideIcon } from 'lucide-react'
import FormGroup from '@/components/FormGroup'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'

export interface ChoiceOption<Value extends string> {
  value: Value
  label: string
  /** Qué pasa al elegirla, cuando el nombre solo no basta. */
  description?: string
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
  const groupId = useId()

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
          {options.map(({ value: optionValue, label: optionLabel, description, icon: Icon }) => {
            const nameId = `${groupId}-${optionValue}-name`
            const descriptionId = `${groupId}-${optionValue}-description`

            return (
              <Label
                key={optionValue}
                className={cn(
                  'cursor-pointer rounded-lg border p-3 font-normal transition-colors hover:bg-muted/50 has-data-checked:border-primary has-data-checked:bg-primary/5 has-focus-visible:ring-3 has-focus-visible:ring-ring/50',
                  // Con explicación la tarjeta tiene dos líneas: el botón y el icono se quedan en la primera.
                  description && 'items-start',
                )}
              >
                {/* El nombre de la opción es solo su rótulo; la explicación se anuncia aparte, como descripción. */}
                <RadioGroupItem
                  value={optionValue}
                  aria-labelledby={nameId}
                  aria-describedby={description ? descriptionId : undefined}
                />
                {/* `shrink-0`: con un texto largo al lado, el icono no debe ceder su ancho. */}
                {Icon && <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />}
                <span className="grid gap-1">
                  <span id={nameId}>{optionLabel}</span>
                  {description && (
                    <span id={descriptionId} className="text-xs leading-relaxed text-muted-foreground">
                      {description}
                    </span>
                  )}
                </span>
              </Label>
            )
          })}
        </RadioGroup>
      )}
    </FormGroup>
  )
}

export default ChoiceGroup
