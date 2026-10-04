import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useAddressSearch } from '@/features/properties/hooks/useAddressSearch'
import type { GeocodingService } from '@/features/properties/services/geocodingService'
import { getDepartmentView } from '@/features/properties/utils/departments'

type Locate = GeocodingService['locate']

const LOCATION = {
  department: 'francisco-morazan',
  city: 'Tegucigalpa (Distrito Central)',
  neighborhood: 'Colonia Palmira',
}

const setup = (locate: Locate = vi.fn<Locate>(async () => undefined)) => {
  const view = renderHook(() => useAddressSearch(locate))
  return { locate, ...view }
}

describe('useAddressSearch', () => {
  it('empieza sin ninguna búsqueda en curso ni nada que revisar', () => {
    // Arrange: formulario recién abierto

    // Act
    const { result } = setup()

    // Assert
    expect(result.current.search).toEqual({ status: 'idle' })
  })

  it('pregunta al buscador con los nombres del departamento y la ciudad, no con sus identificadores', async () => {
    // Arrange
    const { result, locate } = setup()

    // Act
    await act(() => result.current.start(LOCATION))

    // Assert
    expect(locate).toHaveBeenCalledExactlyOnceWith({
      neighborhood: 'Colonia Palmira',
      city: 'Tegucigalpa',
      department: 'Francisco Morazán',
    })
  })

  it('mientras busca lo indica', async () => {
    // Arrange
    let finish: () => void = () => {}
    const pending = new Promise<undefined>((resolve) => {
      finish = () => resolve(undefined)
    })
    const { result } = setup(() => pending)

    // Act
    let searching: Promise<void> = Promise.resolve()
    act(() => {
      searching = result.current.start(LOCATION)
    })
    const statusWhileSearching = result.current.search.status
    await act(async () => {
      finish()
      await searching
    })

    // Assert
    expect(statusWhileSearching).toBe('searching')
  })

  it('si encuentra la colonia, la muestra de cerca para revisarla', async () => {
    // Arrange
    const point = { lat: 14.1021, lng: -87.1897 }
    const { result } = setup(async () => ({ point, precision: 'neighborhood' }))

    // Act
    await act(() => result.current.start(LOCATION))

    // Assert
    expect(result.current.search).toEqual({
      status: 'reviewing',
      review: { precision: 'neighborhood', view: { center: point, zoom: 16 } },
    })
  })

  it('si solo encuentra la ciudad, la muestra desde más lejos', async () => {
    // Arrange
    const point = { lat: 14.0723, lng: -87.1921 }
    const { result } = setup(async () => ({ point, precision: 'city' }))

    // Act
    await act(() => result.current.start(LOCATION))

    // Assert
    expect(result.current.search.review).toEqual({ precision: 'city', view: { center: point, zoom: 14 } })
  })

  it.each([
    { when: 'no encuentra la dirección', locate: async () => undefined },
    { when: 'el buscador falla', locate: () => Promise.reject(new Error('sin conexión')) },
  ])('si $when, abre el mapa en la cabecera del departamento para marcar el punto a mano', async ({ locate }) => {
    // Arrange
    const { result } = setup(locate)

    // Act
    await act(() => result.current.start(LOCATION))

    // Assert
    expect(result.current.search).toEqual({
      status: 'reviewing',
      review: { precision: 'department', view: getDepartmentView('francisco-morazan') },
    })
  })

  it('al cerrar la revisión deja de mostrarla, pero conserva su contenido mientras la ventana se cierra', async () => {
    // Arrange
    const { result } = setup()
    await act(() => result.current.start(LOCATION))
    const shown = result.current.search.review

    // Act
    act(() => result.current.close())

    // Assert
    expect(result.current.search.status).toBe('idle')
    expect(result.current.search.review).toEqual(shown)
  })
})
