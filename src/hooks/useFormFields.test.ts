import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useFormFields } from '@/hooks/useFormFields'
import type { FieldErrors } from '@/shared/utils/validators'

interface Values {
  name: string
  subscribed: boolean
}

const INITIAL_VALUES: Values = { name: '', subscribed: false }

const requireName = (values: Values): FieldErrors<Values> => ({
  name: values.name ? undefined : 'Escribe tu nombre.',
})

const setup = (validate = requireName) => renderHook(() => useFormFields({ initialValues: INITIAL_VALUES, validate }))

describe('useFormFields', () => {
  it('empieza con los valores iniciales y sin errores', () => {
    // Arrange: formulario recién abierto

    // Act
    const { result } = setup()

    // Assert
    expect(result.current.values).toEqual(INITIAL_VALUES)
    expect(result.current.errors).toEqual({})
  })

  it('cambia un campo sin tocar los demás, sea texto o casilla', () => {
    // Arrange
    const { result } = setup()

    // Act
    act(() => result.current.change('name', 'Ana'))
    act(() => result.current.change('subscribed', true))

    // Assert
    expect(result.current.values).toEqual({ name: 'Ana', subscribed: true })
  })

  it('al validar muestra los errores y avisa de que no se puede enviar', () => {
    // Arrange
    const { result } = setup()

    // Act
    let isValid = true
    act(() => {
      isValid = result.current.validateFields()
    })

    // Assert
    expect(isValid).toBe(false)
    expect(result.current.errors).toEqual({ name: 'Escribe tu nombre.' })
  })

  it('valida con los valores más recientes y da paso al envío cuando no hay errores', () => {
    // Arrange
    const validate = vi.fn(requireName)
    const { result } = setup(validate)
    act(() => result.current.change('name', 'Ana'))

    // Act
    let isValid = false
    act(() => {
      isValid = result.current.validateFields()
    })

    // Assert
    expect(validate).toHaveBeenLastCalledWith({ name: 'Ana', subscribed: false })
    expect(isValid).toBe(true)
  })

  it('al corregir un campo retira solo su error', () => {
    // Arrange
    const validate = (): FieldErrors<Values> => ({ name: 'Escribe tu nombre.', subscribed: 'Acepta para continuar.' })
    const { result } = setup(validate)
    act(() => {
      result.current.validateFields()
    })

    // Act
    act(() => result.current.change('name', 'Ana'))

    // Assert
    expect(result.current.errors).toEqual({ name: undefined, subscribed: 'Acepta para continuar.' })
  })
})

describe('useFormFields: validar solo una parte', () => {
  const invalidEverywhere = (): FieldErrors<Values> => ({
    name: 'Escribe tu nombre.',
    subscribed: 'Acepta para continuar.',
  })

  it('marca solo los campos pedidos y avisa de que esa parte tiene errores', () => {
    // Arrange
    const { result } = setup(invalidEverywhere)

    // Act
    let isValid = true
    act(() => {
      isValid = result.current.validateFields(['name'])
    })

    // Assert
    expect(isValid).toBe(false)
    expect(result.current.errors).toEqual({ name: 'Escribe tu nombre.' })
  })

  it('da por buena una parte sin errores aunque el resto del formulario los tenga', () => {
    // Arrange
    const { result } = setup(requireName)

    // Act
    let isValid = false
    act(() => {
      isValid = result.current.validateFields(['subscribed'])
    })

    // Assert
    expect(isValid).toBe(true)
  })

  it('conserva los errores ya mostrados de los campos que no se están validando', () => {
    // Arrange
    const { result } = setup(invalidEverywhere)
    act(() => {
      result.current.validateFields(['name'])
    })

    // Act
    act(() => {
      result.current.validateFields(['subscribed'])
    })

    // Assert
    expect(result.current.errors).toEqual({ name: 'Escribe tu nombre.', subscribed: 'Acepta para continuar.' })
  })
})
