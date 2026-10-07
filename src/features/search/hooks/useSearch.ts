import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import type { PropertyFilters, PropertyOperation } from '@/features/properties/types/property.types'
import { buildSearchPath } from '@/features/search/utils/buildSearchQuery'

export const useSearch = (initialFilters: PropertyFilters) => {
  const navigate = useNavigate()
  const { pathname, search } = useLocation()
  const [filters, setFilters] = useState(initialFilters)

  const update = (changes: Partial<PropertyFilters>) => setFilters((current) => ({ ...current, ...changes }))

  // Las escalas de precio de venta y alquiler son distintas, así que los precios elegidos dejan de ser válidos.
  const changeOperation = (operation: PropertyOperation | undefined) =>
    update({ operation, minPrice: undefined, maxPrice: undefined })

  const submit = () => {
    const results = buildSearchPath(filters)

    // Repetir la búsqueda que ya se está viendo no apila otra entrada: «atrás» sigue saliendo a la primera.
    return navigate(results, { replace: results === pathname + search })
  }

  return { filters, update, changeOperation, submit }
}
