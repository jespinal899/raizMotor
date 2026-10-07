import { useId } from 'react'
import type { FormEvent } from 'react'
import { MapPin, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { PropertyFilters } from '@/features/properties/types/property.types'
import { isPropertyType } from '@/features/properties/utils/propertyGuards'
import OperationToggle from '@/features/search/components/OperationToggle'
import SearchField from '@/features/search/components/SearchField'
import SelectField from '@/features/search/components/SelectField'
import { useSearch } from '@/features/search/hooks/useSearch'
import {
  ANY_OPTION,
  TYPE_OPTIONS,
  getMaxPriceOptions,
  toOptionValue,
} from '@/features/search/utils/searchOptions'
import { cn } from '@/lib/utils'

const DEFAULT_FILTERS: PropertyFilters = { operation: 'venta' }

interface SearchBarProps {
  initialFilters?: PropertyFilters
  className?: string
}

const SearchBar = ({ initialFilters = DEFAULT_FILTERS, className }: SearchBarProps) => {
  const { filters, update, changeOperation, submit } = useSearch(initialFilters)
  const locationLabelId = useId()
  const priceOptions = getMaxPriceOptions(filters.operation)

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    submit()
  }

  return (
    <form
      role="search"
      aria-label="Buscar propiedades"
      onSubmit={handleSubmit}
      className={cn(
        'grid gap-4 rounded-2xl border bg-card p-4 shadow-lg md:grid-cols-2 lg:grid-cols-[auto_1fr_1.3fr_1fr_auto] lg:items-end',
        className,
      )}
    >
      <OperationToggle value={filters.operation} onChange={changeOperation} />

      <SelectField
        label="Tipo de propiedad"
        options={TYPE_OPTIONS}
        value={toOptionValue(TYPE_OPTIONS, filters.type)}
        onChange={(value) => update({ type: isPropertyType(value) ? value : undefined })}
      />

      <SearchField label="Ubicación" labelId={locationLabelId}>
        <div className="relative">
          <MapPin
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            aria-labelledby={locationLabelId}
            value={filters.location ?? ''}
            onChange={(event) => update({ location: event.target.value })}
            placeholder="Colonia o ciudad"
            autoComplete="off"
            className="h-11 pl-9"
          />
        </div>
      </SearchField>

      <SelectField
        label="Precio máximo"
        options={priceOptions}
        value={toOptionValue(priceOptions, filters.maxPrice)}
        onChange={(value) => update({ maxPrice: value === ANY_OPTION ? undefined : Number(value) })}
      />

      <Button type="submit" size="lg" className="h-11 px-6 text-base md:col-span-2 lg:col-span-1">
        <Search />
        Buscar
      </Button>
    </form>
  )
}

export default SearchBar
