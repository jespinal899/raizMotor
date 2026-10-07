import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useFeaturedProperties } from '@/features/properties/hooks/useFeaturedProperties'
import { useProperties } from '@/features/properties/hooks/useProperties'
import type { PropertyFilters } from '@/features/properties/types/property.types'
import type { PageRequest } from '@/shared/types/common.types'
import { buildPage, buildProperties, buildProperty, buildPropertyService } from '@/test/factories'

const FIRST_PAGE: PageRequest = { page: 1, pageSize: 6 }

interface Props {
  filters: PropertyFilters
  pageRequest: PageRequest
}

describe('useProperties', () => {
  it('pide al servicio las propiedades con los filtros y la página recibidos', async () => {
    // Arrange
    const house = buildProperty({ id: 'casa' })
    const service = buildPropertyService({ search: vi.fn(async () => buildPage([house])) })
    const filters: PropertyFilters = { type: 'casa', operation: 'venta' }

    // Act
    const { result } = renderHook(() => useProperties(filters, FIRST_PAGE, service))

    // Assert
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(service.search).toHaveBeenCalledWith(filters, FIRST_PAGE)
    expect(result.current.properties).toEqual([house])
  })

  it('expone el total, la página y el máximo de páginas que devuelve el servicio', async () => {
    // Arrange
    const secondPage = buildPage(buildProperties(5), { total: 11, page: 2, totalPages: 2 })
    const service = buildPropertyService({ search: vi.fn(async () => secondPage) })

    // Act
    const { result } = renderHook(() => useProperties({}, { page: 2, pageSize: 6 }, service))

    // Assert
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current).toMatchObject({ total: 11, page: 2, totalPages: 2 })
    expect(result.current.properties).toHaveLength(5)
  })

  it('usa la página que corrige el servicio cuando la pedida estaba fuera de rango', async () => {
    // Arrange
    const lastPage = buildPage(buildProperties(5), { total: 11, page: 2, totalPages: 2 })
    const service = buildPropertyService({ search: vi.fn(async () => lastPage) })

    // Act
    const { result } = renderHook(() => useProperties({}, { page: 99, pageSize: 6 }, service))

    // Assert
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.page).toBe(2)
  })

  it('mientras carga devuelve una lista vacía y una sola página', () => {
    // Arrange
    const service = buildPropertyService({ search: () => new Promise(() => {}) })

    // Act
    const { result } = renderHook(() => useProperties({}, FIRST_PAGE, service))

    // Assert
    expect(result.current).toMatchObject({ properties: [], total: 0, page: 1, totalPages: 1, isLoading: true })
  })

  it('vuelve a buscar cuando cambian los filtros', async () => {
    // Arrange
    const service = buildPropertyService()
    const { result, rerender } = renderHook(
      ({ filters, pageRequest }: Props) => useProperties(filters, pageRequest, service),
      { initialProps: { filters: { type: 'casa' }, pageRequest: FIRST_PAGE } },
    )
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    // Act
    rerender({ filters: { type: 'terreno' }, pageRequest: FIRST_PAGE })

    // Assert
    await waitFor(() => expect(service.search).toHaveBeenLastCalledWith({ type: 'terreno' }, FIRST_PAGE))
    expect(service.search).toHaveBeenCalledTimes(2)
  })

  it.each<[string, PropertyFilters]>([
    ['el precio mínimo', { minPrice: 100000 }],
    ['el precio máximo', { maxPrice: 350000 }],
    ['los dormitorios', { minBedrooms: 3 }],
    ['los baños', { minBathrooms: 2 }],
    ['el orden', { sort: 'price-asc' }],
    ['la zona', { location: 'Tegucigalpa' }],
    ['la operación', { operation: 'alquiler' }],
  ])('vuelve a buscar cuando cambia %s: ningún filtro se queda sin aplicar', async (_filter, change) => {
    // Arrange
    const service = buildPropertyService()
    const { result, rerender } = renderHook(
      ({ filters, pageRequest }: Props) => useProperties(filters, pageRequest, service),
      { initialProps: { filters: { type: 'casa' }, pageRequest: FIRST_PAGE } },
    )
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    // Act
    rerender({ filters: { type: 'casa', ...change }, pageRequest: FIRST_PAGE })

    // Assert
    await waitFor(() => expect(service.search).toHaveBeenLastCalledWith({ type: 'casa', ...change }, FIRST_PAGE))
    expect(service.search).toHaveBeenCalledTimes(2)
  })

  it('no repite la búsqueda si los mismos filtros llegan en otro orden o con huecos sin valor', async () => {
    // Arrange
    const service = buildPropertyService()
    const { result, rerender } = renderHook(
      ({ filters, pageRequest }: Props) => useProperties(filters, pageRequest, service),
      { initialProps: { filters: { type: 'casa', minBedrooms: 3 }, pageRequest: FIRST_PAGE } },
    )
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    // Act
    rerender({ filters: { minBedrooms: 3, sort: undefined, type: 'casa' }, pageRequest: FIRST_PAGE })

    // Assert
    expect(service.search).toHaveBeenCalledTimes(1)
  })

  it('vuelve a buscar cuando cambia la página', async () => {
    // Arrange
    const service = buildPropertyService()
    const { result, rerender } = renderHook(
      ({ filters, pageRequest }: Props) => useProperties(filters, pageRequest, service),
      { initialProps: { filters: {}, pageRequest: FIRST_PAGE } },
    )
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    // Act
    rerender({ filters: {}, pageRequest: { page: 2, pageSize: 6 } })

    // Assert
    await waitFor(() => expect(service.search).toHaveBeenLastCalledWith({}, { page: 2, pageSize: 6 }))
    expect(service.search).toHaveBeenCalledTimes(2)
  })

  it('no repite la búsqueda si filtros y página tienen los mismos valores', async () => {
    // Arrange
    const service = buildPropertyService()
    const { result, rerender } = renderHook(
      ({ filters, pageRequest }: Props) => useProperties(filters, pageRequest, service),
      { initialProps: { filters: { type: 'casa' }, pageRequest: FIRST_PAGE } },
    )
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    // Act
    rerender({ filters: { type: 'casa' }, pageRequest: { page: 1, pageSize: 6 } })

    // Assert
    expect(service.search).toHaveBeenCalledTimes(1)
  })

  it('expone el error del servicio', async () => {
    // Arrange
    const service = buildPropertyService({ search: () => Promise.reject(new Error('API caída')) })

    // Act
    const { result } = renderHook(() => useProperties({}, FIRST_PAGE, service))

    // Assert
    await waitFor(() => expect(result.current.error?.message).toBe('API caída'))
    expect(result.current.properties).toEqual([])
  })
})

describe('useFeaturedProperties', () => {
  it('devuelve las propiedades destacadas del servicio', async () => {
    // Arrange
    const featured = buildProperty({ id: 'destacada', featured: true })
    const service = buildPropertyService({ getFeatured: vi.fn(async () => [featured]) })

    // Act
    const { result } = renderHook(() => useFeaturedProperties(service))

    // Assert
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.properties).toEqual([featured])
  })
})
