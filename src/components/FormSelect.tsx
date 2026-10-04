import FormField from '@/components/FormField'
import OptionSelect from '@/components/OptionSelect'
import type { SelectOption } from '@/shared/types/common.types'

interface FormSelectProps {
  label: string
  placeholder: string
  options: SelectOption[]
  /** Cadena vacía cuando aún no se eligió nada. */
  value: string
  onChange: (value: string) => void
  error?: string
}

const FormSelect = ({ label, placeholder, options, value, onChange, error }: FormSelectProps) => {
  return (
    <FormField label={label} error={error}>
      {(control) => (
        <OptionSelect
          options={options}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          triggerProps={control}
        />
      )}
    </FormField>
  )
}

export default FormSelect
