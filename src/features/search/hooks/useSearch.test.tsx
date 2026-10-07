import { act, renderHook } from '@testing-library/react'
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import type { PropertyFilters } from '@/features/properties/types/property.types'
import { useSearch } from '@/features/search/hooks/useSearch'

const renderSearch = (initialFilters: PropertyFilters) =>
  renderHook(
    () => {
      const location = useLocation()
      const navigate = useNavigate()
      return {
        search: useSearch(initialFilters),
        path: location.pathname + location.search,
        goBack: () => navigate(-1),
      }
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

  it('repetir la misma búsqueda no apila otra entrada en el historial: «atrás» sale de los resultados a la primera', async () => {
    // Arrange
    const { result } = renderSearch({ operation: 'venta', type: 'terreno' })
    const startingPath = result.current.path
    act(() => result.current.search.submit())
    act(() => result.current.search.submit())

    // Act
    await act(() => result.current.goBack())

    // Assert
    expect(result.current.path).toBe(startingPath)
  })

  it('una búsqueda distinta sí queda en el historial, para poder volver a la anterior', async () => {
    // Arrange
    const { result } = renderSearch({ operation: 'venta', type: 'terreno' })
    act(() => result.current.search.submit())
    act(() => result.current.search.update({ location: 'Tela' }))
    act(() => result.current.search.submit())

    // Act
    await act(() => result.current.goBack())

    // Assert
    expect(result.current.path).toBe('/propiedades/terrenos?operacion=venta')
  })

  it('changeOperation descarta también el precio mínimo, que es de la otra escala', () => {
    // Arrange
    const { result } = renderSearch({ operation: 'venta', minPrice: 100000, minBedrooms: 3 })

    // Act
    act(() => result.current.search.changeOperation('alquiler'))

    // Assert
    expect(result.current.search.filters).toEqual({ operation: 'alquiler', minBedrooms: 3 })
  })

  it('submit conserva en la URL los filtros que afinan la búsqueda', () => {
    // Arrange
    const { result } = renderSearch({ operation: 'venta', minBedrooms: 3, sort: 'price-asc' })

    // Act
    act(() => void result.current.search.submit())

    // Assert
    expect(result.current.path).toBe('/propiedades?operacion=venta&dormitorios=3&orden=price-asc')
  })
})
