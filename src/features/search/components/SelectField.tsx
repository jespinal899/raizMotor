import { useId } from 'react'
import OptionSelect from '@/components/OptionSelect'
import SearchField from '@/features/search/components/SearchField'
import type { SelectOption } from '@/shared/types/common.types'

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
      <OptionSelect options={options} value={value} onChange={onChange} triggerProps={{ 'aria-labelledby': labelId }} />
    </SearchField>
  )
}

export default SelectField
