import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { usePublicationForm } from '@/features/properties/hooks/usePublicationForm'
import type { PropertyPublication, PublicationFormValues } from '@/features/properties/types/publication.types'
import { toPublication } from '@/features/properties/utils/toPublication'
import { deferred } from '@/test/deferred'
import { buildPublicationValues } from '@/test/factories'
import { anyOperationKey } from '@/test/operationKey'

type Submit = (publication: PropertyPublication, operationKey: string) => Promise<void>
type Result = ReturnType<typeof setup>['result']

const setup = (onSubmit: Submit = vi.fn(async () => {})) => {
  const view = renderHook(() => usePublicationForm({ onSubmit }))
  return { onSubmit, ...view }
}

const setField = <Field extends keyof PublicationFormValues>(
  result: Result,
  field: Field,
  value: PublicationFormValues[Field],
) => act(() => result.current.change(field, value))

/** Rellena campo a campo. El departamento va primero porque cambiarlo borra el punto del mapa. */
const fillForm = (result: Result, values: PublicationFormValues = buildPublicationValues()) => {
  const { department, ...rest } = values

  setField(result, 'department', department)
  for (const field of Object.keys(rest) as (keyof typeof rest)[]) setField(result, field, rest[field])
}

describe('usePublicationForm', () => {
  it('empieza vacío, sin punto en el mapa, sin fotos, sin errores y sin resultado', () => {
    // Arrange: formulario recién abierto

    // Act
    const { result } = setup()

    // Assert
    expect(result.current.values).toEqual({
      department: '',
      city: '',
      neighborhood: '',
      address: '',
      coordinates: null,
      type: '',
      builtArea: '',
      landArea: '',
      bedrooms: '',
      bathrooms: '',
      parking: '',
      features: [],
      title: '',
      description: '',
      operation: '',
      price: '',
      images: [],
    })
    expect(result.current.errors).toEqual({})
    expect(result.current.status).toBe('idle')
  })

  it('no publica y muestra los errores si faltan datos', async () => {
    // Arrange
    const { result, onSubmit } = setup()

    // Act
    await act(() => result.current.submit())

    // Assert
    expect(onSubmit).not.toHaveBeenCalled()
    expect(result.current.errors.department).toBe('Selecciona el departamento.')
    expect(result.current.errors.images).toBe('Agrega al menos una foto.')
    expect(result.current.status).toBe('idle')
  })

  it('envía la publicación ya convertida y queda como publicada', async () => {
    // Arrange
    const values = buildPublicationValues()
    const { result, onSubmit } = setup()
    fillForm(result, values)

    // Act
    await act(() => result.current.submit())

    // Assert
    expect(onSubmit).toHaveBeenCalledExactlyOnceWith(toPublication(values), anyOperationKey())
    expect(result.current.status).toBe('published')
  })

  it('mientras la publicación está en curso lo indica', async () => {
    // Arrange
    let finish: () => void = () => {}
    const pending = new Promise<void>((resolve) => {
      finish = resolve
    })
    const { result } = setup(() => pending)
    fillForm(result)

    // Act
    let submission: Promise<void> = Promise.resolve()
    act(() => {
      submission = result.current.submit()
    })
    const statusWhileSubmitting = result.current.status
    await act(async () => {
      finish()
      await submission
    })

    // Assert
    expect(statusWhileSubmitting).toBe('submitting')
    expect(result.current.status).toBe('published')
  })

  it('queda como fallida cuando no se puede guardar el anuncio', async () => {
    // Arrange
    const { result } = setup(() => Promise.reject(new Error('almacenamiento no disponible')))
    fillForm(result)

    // Act
    await act(() => result.current.submit())

    // Assert
    expect(result.current.status).toBe('failed')
  })

  it('al corregir un campo quita solo su error', async () => {
    // Arrange
    const { result } = setup()
    await act(() => result.current.submit())

    // Act
    setField(result, 'city', 'Tegucigalpa')

    // Assert
    expect(result.current.errors.city).toBeUndefined()
    expect(result.current.errors.address).toBe('Escribe la dirección.')
  })

  it('al cambiar de departamento descarta la ciudad y el punto confirmado, que eran del anterior', () => {
    // Arrange
    const { result } = setup()
    setField(result, 'department', 'cortes')
    setField(result, 'city', 'San Pedro Sula')
    setField(result, 'coordinates', { lat: 15.5, lng: -88.03 })

    // Act
    setField(result, 'department', 'yoro')

    // Assert
    expect(result.current.values.department).toBe('yoro')
    expect(result.current.values.city).toBe('')
    expect(result.current.values.coordinates).toBeNull()
  })

  it.each([
    { field: 'city', value: 'Choloma' },
    { field: 'neighborhood', value: 'Colonia Trejo' },
    { field: 'address', value: '10 calle, casa 25' },
  ] as const)('al cambiar "$field" hay que volver a confirmar la dirección en el mapa', ({ field, value }) => {
    // Arrange
    const { result } = setup()
    fillForm(result)

    // Act
    setField(result, field, value)

    // Assert
    expect(result.current.values.coordinates).toBeNull()
  })

  it('cambiar un dato que no es de la dirección conserva el punto confirmado', () => {
    // Arrange
    const values = buildPublicationValues()
    const { result } = setup()
    fillForm(result, values)

    // Act
    setField(result, 'title', 'Casa con jardín en Palmira')

    // Assert
    expect(result.current.values.coordinates).toEqual(values.coordinates)
  })

  it('puede validar solo los datos de un paso', () => {
    // Arrange
    const { result } = setup()

    // Act
    let isValid = true
    act(() => {
      isValid = result.current.validate(['title', 'description'])
    })

    // Assert
    expect(isValid).toBe(false)
    expect(result.current.errors.title).toBe('Escribe un título para el anuncio.')
    expect(result.current.errors.department).toBeUndefined()
  })

  it('al editar después de un intento retira el aviso', async () => {
    // Arrange
    const { result } = setup(() => Promise.reject(new Error('almacenamiento no disponible')))
    fillForm(result)
    await act(() => result.current.submit())

    // Act
    setField(result, 'price', '150000')

    // Assert
    expect(result.current.status).toBe('idle')
  })
})

describe('usePublicationForm: durante el envío', () => {
  it('editar un campo mientras se publica no reactiva el envío', async () => {
    // Arrange
    const { result } = setup(() => new Promise<void>(() => {}))
    fillForm(result)
    act(() => {
      void result.current.submit()
    })

    // Act
    setField(result, 'price', '150000')

    // Assert
    expect(result.current.status).toBe('submitting')
  })
})

describe('usePublicationForm: repetir el envío no lo duplica', () => {
  const keysOf = (onSubmit: ReturnType<typeof vi.fn<Submit>>) => onSubmit.mock.calls.map(([, operationKey]) => operationKey)

  it('enviar dos veces seguidas, con el primer envío aún en curso, publica un solo anuncio', async () => {
    // Arrange
    const { promise, finish } = deferred()
    const onSubmit = vi.fn<Submit>(() => promise)
    const { result } = setup(onSubmit)
    fillForm(result)

    // Act
    let first: Promise<void> = Promise.resolve()
    let second: Promise<void> = Promise.resolve()
    act(() => {
      first = result.current.submit()
      second = result.current.submit()
    })
    await act(async () => {
      finish()
      await Promise.all([first, second])
    })

    // Assert
    expect(onSubmit).toHaveBeenCalledOnce()
    expect(result.current.status).toBe('published')
  })

  it('una vez hecho, repetirlo sin cambiar nada no publica otro anuncio', async () => {
    // Arrange
    const onSubmit = vi.fn<Submit>(async () => {})
    const { result } = setup(onSubmit)
    fillForm(result)
    await act(() => result.current.submit())

    // Act
    await act(() => result.current.submit())

    // Assert
    expect(onSubmit).toHaveBeenCalledOnce()
    expect(result.current.status).toBe('published')
  })

  it('si después se cambia algún dato, es otra publicación y lleva otra clave', async () => {
    // Arrange
    const onSubmit = vi.fn<Submit>(async () => {})
    const { result } = setup(onSubmit)
    fillForm(result)
    await act(() => result.current.submit())

    // Act
    setField(result, 'title', 'Casa amplia con patio y cochera')
    await act(() => result.current.submit())

    // Assert
    const [first, second] = keysOf(onSubmit)
    expect(onSubmit).toHaveBeenCalledTimes(2)
    expect(second).not.toBe(first)
  })

  it('reintentar tras un fallo lleva la misma clave, para que el servicio reconozca el reintento', async () => {
    // Arrange
    const onSubmit = vi.fn<Submit>(() => Promise.reject(new Error('sin conexión')))
    const { result } = setup(onSubmit)
    fillForm(result)
    await act(() => result.current.submit())

    // Act
    await act(() => result.current.submit())

    // Assert
    const [first, second] = keysOf(onSubmit)
    expect(onSubmit).toHaveBeenCalledTimes(2)
    expect(second).toBe(first)
  })
})
