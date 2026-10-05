import type { ComponentProps } from 'react'
import FormField from '@/components/FormField'
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '@/components/ui/input-group'
import { HONDURAS_DIAL_CODE, formatLocalPhone } from '@/shared/utils/honduranPhone'

type InputProps = Omit<
  ComponentProps<typeof InputGroupInput>,
  'id' | 'type' | 'inputMode' | 'value' | 'onChange' | 'className' | 'aria-invalid' | 'aria-describedby'
>

interface PhoneFieldProps extends InputProps {
  label: string
  error?: string
  /** Solo el número local, sin el prefijo del país. */
  value: string
  /** Recibe el número local ya con su guion, no el evento. */
  onChange: (value: string) => void
}

/**
 * Teléfono de Honduras: el prefijo del país va fijo a la vista y solo se escriben los dígitos del
 * número. Del mismo alto que `TextField`.
 */
const PhoneField = ({ label, error, onChange, ...inputProps }: PhoneFieldProps) => {
  return (
    <FormField label={label} error={error}>
      {(control) => (
        <InputGroup className="h-11">
          <InputGroupAddon className="pl-2.5">
            {/* Mismo tamaño de letra que el campo, para que prefijo y número se lean como uno solo. */}
            <InputGroupText className="text-base md:text-sm">{HONDURAS_DIAL_CODE}</InputGroupText>
          </InputGroupAddon>
          <InputGroupInput
            placeholder="9999-9999"
            // `tel-national`: el navegador rellena el número sin el prefijo del país, que ya está puesto.
            autoComplete="tel-national"
            {...inputProps}
            {...control}
            type="tel"
            inputMode="numeric"
            onChange={(event) => onChange(formatLocalPhone(event.target.value))}
            className="h-full"
          />
        </InputGroup>
      )}
    </FormField>
  )
}

export default PhoneField
