import { act, renderHook } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import type { PropertyFilters } from '@/features/properties/types/property.types'
import { useSearch } from '@/features/search/hooks/useSearch'

const renderSearch = (initialFilters: PropertyFilters) =>
  renderHook(
    () => {
      const location = useLocation()
      return { search: useSearch(initialFilters), path: location.pathname + location.search }
    },
    { wrapper: MemoryRouter },
  )

describe('useSearch', () => {
  it('parte de los filtros iniciales', () => {
    // Arrange
    const initialFilters: PropertyFilters = { operation: 'venta', type: 'casa' }

    // Act
    const { result } = renderSearch(initialFilters)

    // Assert
    expect(result.current.search.filters).toEqual(initialFilters)
  })

  it('update combina los cambios con los filtros actuales', () => {
    // Arrange
    const { result } = renderSearch({ operation: 'venta' })

    // Act
    act(() => result.current.search.update({ location: 'Cusco' }))

    // Assert
    expect(result.current.search.filters).toEqual({ operation: 'venta', location: 'Cusco' })
  })

  it('changeOperation descarta el precio máximo porque la escala cambia', () => {
    // Arrange
    const { result } = renderSearch({ operation: 'venta', maxPrice: 500000, type: 'casa' })

    // Act
    act(() => result.current.search.changeOperation('alquiler'))

    // Assert
    expect(result.current.search.filters).toEqual({
      operation: 'alquiler',
      maxPrice: undefined,
      type: 'casa',
    })
  })

  it('submit navega a la URL de resultados con los filtros actuales', () => {
    // Arrange
    const { result } = renderSearch({ operation: 'venta', type: 'terreno' })
    act(() => result.current.search.update({ maxPrice: 100000 }))

    // Act
    act(() => result.current.search.submit())

    // Assert
    expect(result.current.path).toBe('/propiedades/terrenos?operacion=venta&precioMax=100000')
  })
})
