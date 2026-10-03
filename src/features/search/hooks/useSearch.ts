import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { PropertyFilters, PropertyOperation } from '@/features/properties/types/property.types'
import { buildSearchPath } from '@/features/search/utils/buildSearchQuery'

export const useSearch = (initialFilters: PropertyFilters) => {
  const navigate = useNavigate()
  const [filters, setFilters] = useState(initialFilters)

  const update = (changes: Partial<PropertyFilters>) => setFilters((current) => ({ ...current, ...changes }))

  // Las escalas de precio de venta y alquiler son distintas, así que el máximo elegido deja de ser válido.
  const changeOperation = (operation: PropertyOperation | undefined) =>
    update({ operation, maxPrice: undefined })

  const submit = () => navigate(buildSearchPath(filters))

  return { filters, update, changeOperation, submit }
}
