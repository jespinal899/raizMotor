import { useId } from 'react'
import { OPERATIONS } from '@/features/properties/data/propertyOptions.data'
import type { PropertyOperation } from '@/features/properties/types/property.types'
import SearchField from '@/features/search/components/SearchField'
import { cn } from '@/lib/utils'

const operations = Object.keys(OPERATIONS) as PropertyOperation[]

interface OperationToggleProps {
  value: PropertyOperation | undefined
  onChange: (operation: PropertyOperation | undefined) => void
}

const OperationToggle = ({ value, onChange }: OperationToggleProps) => {
  const labelId = useId()

  return (
    <SearchField label="Operación" labelId={labelId}>
      <div role="group" aria-labelledby={labelId} className="grid h-11 grid-cols-2 gap-1 rounded-lg bg-muted p-1">
        {operations.map((operation) => {
          const selected = value === operation

          return (
            <button
              key={operation}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(selected ? undefined : operation)}
              className={cn(
                'rounded-md px-4 text-sm font-medium outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50',
                selected
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {OPERATIONS[operation].action}
            </button>
          )
        })}
      </div>
    </SearchField>
  )
}

export default OperationToggle
