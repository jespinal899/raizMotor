import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useContactForm } from '@/features/contact/hooks/useContactForm'
import { ContactUnavailableError } from '@/features/contact/services/contactService'
import type { ContactFormValues } from '@/features/contact/types/contact.types'
import { deferred } from '@/test/deferred'
import { anyOperationKey } from '@/test/operationKey'

type Submit = (values: ContactFormValues, operationKey: string) => Promise<void>

const setup = (onSubmit: Submit = vi.fn(async () => {}), initialDescription?: string) => {
  const view = renderHook(() => useContactForm({ initialDescription, onSubmit }))
  return { onSubmit, ...view }
}

const fillValidForm = (result: ReturnType<typeof setup>['result']) => {
  act(() => result.current.change('name', 'Ana'))
  act(() => result.current.change('email', 'ana@gmail.com'))
  act(() => result.current.change('description', 'Quiero publicar mi casa.'))
}

describe('useContactForm', () => {
  it('empieza vacío, sin errores y sin haber enviado', () => {
    // Arrange: sin descripción inicial

    // Act
    const { result } = setup()

    // Assert
    expect(result.current.values).toEqual({ name: '', email: '', phone: '', description: '' })
    expect(result.current.errors).toEqual({})
    expect(result.current.status).toBe('idle')
  })

  it('parte de la descripción inicial cuando la consulta tiene un motivo', () => {
    // Arrange
    const initialDescription = 'Me interesa el plan Inmobiliaria.'

    // Act
    const { result } = setup(undefined, initialDescription)

    // Assert
    expect(result.current.values.description).toBe(initialDescription)
  })

  it('no envía y muestra los errores si el formulario es inválido', async () => {
    // Arrange
    const { result, onSubmit } = setup()

    // Act
    await act(() => result.current.submit())

    // Assert
    expect(onSubmit).not.toHaveBeenCalled()
    expect(result.current.errors.name).toBe('Escribe tu nombre.')
    expect(result.current.errors.phone).toBeUndefined()
    expect(result.current.status).toBe('idle')
  })

  it('envía los valores sin espacios sobrantes y queda como enviado', async () => {
    // Arrange
    const { result, onSubmit } = setup()
    fillValidForm(result)
    act(() => result.current.change('phone', ' 8915-0271 '))

    // Act
    await act(() => result.current.submit())

    // Assert
    expect(onSubmit).toHaveBeenCalledExactlyOnceWith({
      name: 'Ana',
      email: 'ana@gmail.com',
      phone: '8915-0271',
      description: 'Quiero publicar mi casa.',
    }, anyOperationKey())
    expect(result.current.status).toBe('sent')
  })

  it('mientras el envío está en curso lo indica', async () => {
    // Arrange
    let finish: () => void = () => {}
    const pending = new Promise<void>((resolve) => {
      finish = resolve
    })
    const { result } = setup(() => pending)
    fillValidForm(result)

    // Act
    let submission: Promise<void> = Promise.resolve()
    act(() => {
      submission = result.current.submit()
    })
    const statusWhileSending = result.current.status
    await act(async () => {
      finish()
      await submission
    })

    // Assert
    expect(statusWhileSending).toBe('sending')
    expect(result.current.status).toBe('sent')
  })

  it('avisa de que el envío no está disponible cuando el correo aún no se ha configurado', async () => {
    // Arrange
    const { result } = setup(() => Promise.reject(new ContactUnavailableError()))
    fillValidForm(result)

    // Act
    await act(() => result.current.submit())

    // Assert
    expect(result.current.status).toBe('unavailable')
  })

  it('marca el envío como fallido ante cualquier otro error', async () => {
    // Arrange
    const { result } = setup(() => Promise.reject(new Error('sin conexión')))
    fillValidForm(result)

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
    act(() => result.current.change('name', 'Ana'))

    // Assert
    expect(result.current.errors.name).toBeUndefined()
    expect(result.current.errors.description).toBe('Describe tu consulta.')
  })

  it('al editar después de enviar retira el aviso del envío', async () => {
    // Arrange
    const { result } = setup()
    fillValidForm(result)
    await act(() => result.current.submit())

    // Act
    act(() => result.current.change('description', 'Otra consulta distinta.'))

    // Assert
    expect(result.current.status).toBe('idle')
  })
})

describe('useContactForm: repetir el envío no lo duplica', () => {
  const keysOf = (onSubmit: ReturnType<typeof vi.fn<Submit>>) => onSubmit.mock.calls.map(([, operationKey]) => operationKey)

  it('enviar dos veces seguidas, con el primer envío aún en curso, manda un solo mensaje', async () => {
    // Arrange
    const { promise, finish } = deferred()
    const onSubmit = vi.fn<Submit>(() => promise)
    const { result } = setup(onSubmit)
    fillValidForm(result)

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
    expect(result.current.status).toBe('sent')
  })

  it('una vez hecho, repetirlo sin cambiar nada no manda otro mensaje', async () => {
    // Arrange
    const onSubmit = vi.fn<Submit>(async () => {})
    const { result } = setup(onSubmit)
    fillValidForm(result)
    await act(() => result.current.submit())

    // Act
    await act(() => result.current.submit())

    // Assert
    expect(onSubmit).toHaveBeenCalledOnce()
    expect(result.current.status).toBe('sent')
  })

  it('si después se cambia algún dato, es un mensaje nuevo y lleva otra clave', async () => {
    // Arrange
    const onSubmit = vi.fn<Submit>(async () => {})
    const { result } = setup(onSubmit)
    fillValidForm(result)
    await act(() => result.current.submit())

    // Act
    act(() => result.current.change('description', 'Quiero publicar dos casas.'))
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
    fillValidForm(result)
    await act(() => result.current.submit())

    // Act
    await act(() => result.current.submit())

    // Assert
    const [first, second] = keysOf(onSubmit)
    expect(onSubmit).toHaveBeenCalledTimes(2)
    expect(second).toBe(first)
  })
})
