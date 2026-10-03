import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useFeaturedProperties } from '@/features/properties/hooks/useFeaturedProperties'
import { useProperties } from '@/features/properties/hooks/useProperties'
import type { PropertyService } from '@/features/properties/services/propertyService'
import type { PropertyFilters } from '@/features/properties/types/property.types'
import { buildProperty } from '@/test/factories'

const createFakeService = (overrides: Partial<PropertyService> = {}): PropertyService => ({
  getFeatured: vi.fn(async () => []),
  search: vi.fn(async () => []),
  ...overrides,
})

describe('useProperties', () => {
  it('pide al servicio las propiedades con los filtros recibidos', async () => {
    // Arrange
    const house = buildProperty({ id: 'casa' })
    const service = createFakeService({ search: vi.fn(async () => [house]) })
    const filters: PropertyFilters = { type: 'casa', operation: 'venta' }

    // Act
    const { result } = renderHook(() => useProperties(filters, service))

    // Assert
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(service.search).toHaveBeenCalledWith(filters)
    expect(result.current.properties).toEqual([house])
  })

  it('devuelve una lista vacía mientras carga', () => {
    // Arrange
    const service = createFakeService({ search: () => new Promise(() => {}) })

    // Act
    const { result } = renderHook(() => useProperties({}, service))

    // Assert
    expect(result.current).toMatchObject({ properties: [], isLoading: true })
  })

  it('vuelve a buscar cuando cambian los filtros', async () => {
    // Arrange
    const service = createFakeService()
    const { result, rerender } = renderHook(
      ({ filters }: { filters: PropertyFilters }) => useProperties(filters, service),
      { initialProps: { filters: { type: 'casa' } } },
    )
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    // Act
    rerender({ filters: { type: 'terreno' } })

    // Assert
    await waitFor(() => expect(service.search).toHaveBeenLastCalledWith({ type: 'terreno' }))
    expect(service.search).toHaveBeenCalledTimes(2)
  })

  it('no repite la búsqueda si los filtros tienen los mismos valores', async () => {
    // Arrange
    const service = createFakeService()
    const { result, rerender } = renderHook(
      ({ filters }: { filters: PropertyFilters }) => useProperties(filters, service),
      { initialProps: { filters: { type: 'casa' } } },
    )
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    // Act
    rerender({ filters: { type: 'casa' } })

    // Assert
    expect(service.search).toHaveBeenCalledTimes(1)
  })

  it('expone el error del servicio', async () => {
    // Arrange
    const service = createFakeService({ search: () => Promise.reject(new Error('API caída')) })

    // Act
    const { result } = renderHook(() => useProperties({}, service))

    // Assert
    await waitFor(() => expect(result.current.error?.message).toBe('API caída'))
    expect(result.current.properties).toEqual([])
  })
})

describe('useFeaturedProperties', () => {
  it('devuelve las propiedades destacadas del servicio', async () => {
    // Arrange
    const featured = buildProperty({ id: 'destacada', featured: true })
    const service = createFakeService({ getFeatured: vi.fn(async () => [featured]) })

    // Act
    const { result } = renderHook(() => useFeaturedProperties(service))

    // Assert
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.properties).toEqual([featured])
  })
})
