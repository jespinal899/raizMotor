import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useProperty } from '@/features/properties/hooks/useProperty'
import { buildProperty, buildPropertyService } from '@/test/factories'

describe('useProperty', () => {
  it('pide al servicio la propiedad con el identificador recibido', async () => {
    // Arrange
    const house = buildProperty({ id: 'casa-1' })
    const service = buildPropertyService({ getById: vi.fn(async () => house) })

    // Act
    const { result } = renderHook(() => useProperty('casa-1', service))

    // Assert
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(service.getById).toHaveBeenCalledWith('casa-1')
    expect(result.current.property).toEqual(house)
  })

  it('no devuelve propiedad cuando el identificador no existe', async () => {
    // Arrange
    const service = buildPropertyService()

    // Act
    const { result } = renderHook(() => useProperty('no-existe', service))

    // Assert
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.property).toBeUndefined()
    expect(result.current.error).toBeUndefined()
  })

  it('vuelve a pedir la propiedad cuando cambia el identificador', async () => {
    // Arrange
    const service = buildPropertyService({
      getById: vi.fn(async (id: string) => buildProperty({ id, title: `Propiedad ${id}` })),
    })
    const { result, rerender } = renderHook(({ id }) => useProperty(id, service), {
      initialProps: { id: 'a' },
    })
    await waitFor(() => expect(result.current.property?.title).toBe('Propiedad a'))

    // Act
    rerender({ id: 'b' })

    // Assert
    await waitFor(() => expect(result.current.property?.title).toBe('Propiedad b'))
  })

  it('expone el error del servicio', async () => {
    // Arrange
    const service = buildPropertyService({ getById: () => Promise.reject(new Error('API caída')) })

    // Act
    const { result } = renderHook(() => useProperty('casa-1', service))

    // Assert
    await waitFor(() => expect(result.current.error?.message).toBe('API caída'))
    expect(result.current.property).toBeUndefined()
  })
})
