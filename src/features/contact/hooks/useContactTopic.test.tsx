import type { ReactNode } from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { useContactTopic } from '@/features/contact/hooks/useContactTopic'
import type { PropertyService } from '@/features/properties/services/propertyService'
import { buildProperty, buildPropertyService } from '@/test/factories'

const renderTopic = (route: string, service: PropertyService = buildPropertyService()) =>
  renderHook(() => useContactTopic(service), {
    wrapper: ({ children }: { children: ReactNode }) => <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>,
  })

describe('useContactTopic', () => {
  it('no hay motivo en una consulta general, y no consulta el servicio', () => {
    // Arrange
    const service = buildPropertyService()

    // Act
    const { result } = renderTopic('/contacto', service)

    // Assert
    expect(result.current).toEqual({ topic: undefined, isLoading: false })
    expect(service.getById).not.toHaveBeenCalled()
  })

  it('carga la propiedad indicada en la URL y enlaza a su página', async () => {
    // Arrange
    const property = buildProperty({ id: 'casa-1', title: 'Casa con jardín' })
    const service = buildPropertyService({ getById: vi.fn(async () => property) })

    // Act
    const { result } = renderTopic('/contacto?propiedad=casa-1', service)

    // Assert
    expect(result.current.isLoading).toBe(true)
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(service.getById).toHaveBeenCalledWith('casa-1')
    expect(result.current.topic).toMatchObject({
      id: 'propiedad:casa-1',
      title: 'Casa con jardín',
      reference: `${window.location.origin}/propiedad/casa-1`,
    })
  })

  it('queda sin motivo si la propiedad de la URL no existe', async () => {
    // Arrange
    const service = buildPropertyService()

    // Act
    const { result } = renderTopic('/contacto?propiedad=no-existe', service)

    // Assert
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.topic).toBeUndefined()
  })

  it('reconoce el plan indicado en la URL sin esperar ninguna carga', () => {
    // Arrange
    const route = '/contacto?plan=agente'

    // Act
    const { result } = renderTopic(route)

    // Assert
    expect(result.current.isLoading).toBe(false)
    expect(result.current.topic).toMatchObject({ id: 'plan:agente', title: 'Agente inmobiliario' })
  })

  it('ignora un plan que no existe', () => {
    // Arrange
    const route = '/contacto?plan=inventado'

    // Act
    const { result } = renderTopic(route)

    // Assert
    expect(result.current.topic).toBeUndefined()
  })
})
