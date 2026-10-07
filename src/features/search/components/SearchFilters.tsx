import { useNavigate } from 'react-router-dom'
import type { PropertyFilters } from '@/features/properties/types/property.types'
import { isPropertySort } from '@/features/properties/utils/propertyGuards'
import SelectField from '@/features/search/components/SelectField'
import { buildSearchPath } from '@/features/search/utils/buildSearchQuery'
import {
  BATHROOM_OPTIONS,
  BEDROOM_OPTIONS,
  SORT_OPTIONS,
  getMinPriceOptions,
  toOptionValue,
  toOptionalNumber,
} from '@/features/search/utils/searchOptions'

interface SearchFiltersProps {
  /** La búsqueda que se está viendo, tal como la dice la dirección de la página. */
  filters: PropertyFilters
}

/**
 * Filtros que afinan una búsqueda ya hecha y el orden de sus resultados. Cada cambio se aplica al
 * momento: lleva a la dirección de la búsqueda con ese filtro, conservando los demás y desde la primera
 * página.
 */
const SearchFilters = ({ filters }: SearchFiltersProps) => {
  const navigate = useNavigate()
  const minPriceOptions = getMinPriceOptions(filters.operation)

  const refine = (changes: Partial<PropertyFilters>) => void navigate(buildSearchPath({ ...filters, ...changes }))

  return (
    <div role="group" aria-label="Afinar la búsqueda" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <SelectField
        label="Precio mínimo"
        options={minPriceOptions}
        value={toOptionValue(minPriceOptions, filters.minPrice)}
        onChange={(value) => refine({ minPrice: toOptionalNumber(value) })}
      />
      <SelectField
        label="Dormitorios"
        options={BEDROOM_OPTIONS}
        value={toOptionValue(BEDROOM_OPTIONS, filters.minBedrooms)}
        onChange={(value) => refine({ minBedrooms: toOptionalNumber(value) })}
      />
      <SelectField
        label="Baños"
        options={BATHROOM_OPTIONS}
        value={toOptionValue(BATHROOM_OPTIONS, filters.minBathrooms)}
        onChange={(value) => refine({ minBathrooms: toOptionalNumber(value) })}
      />
      <SelectField
        label="Ordenar por"
        options={SORT_OPTIONS}
        value={toOptionValue(SORT_OPTIONS, filters.sort)}
        onChange={(value) => refine({ sort: isPropertySort(value) ? value : undefined })}
      />
    </div>
  )
}

export default SearchFilters
