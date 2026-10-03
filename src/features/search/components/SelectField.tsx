import { useId } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import SearchField from '@/features/search/components/SearchField'
import type { SelectOption } from '@/features/search/utils/searchOptions'

interface SelectFieldProps {
  label: string
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
}

const SelectField = ({ label, options, value, onChange }: SelectFieldProps) => {
  const labelId = useId()

  return (
    <SearchField label={label} labelId={labelId}>
      <Select
        items={options}
        value={value}
        onValueChange={(selected) => {
          if (selected !== null) onChange(selected)
        }}
      >
        <SelectTrigger aria-labelledby={labelId} className="w-full data-[size=default]:h-11">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </SearchField>
  )
}

export default SelectField
