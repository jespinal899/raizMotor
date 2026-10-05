import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useAccessForm } from '@/features/auth/hooks/useAccessForm'
import { required, validate } from '@/shared/utils/validators'

interface Values {
  email: string
  password: string
}

const INITIAL_VALUES: Values = { email: '', password: '' }

const validateValues = (values: Values) => ({
  email: validate(values.email, [required('Escribe tu correo.')]),
  password: validate(values.password, [required('Escribe tu contraseña.')]),
})

const setup = () =>
  renderHook(() =>
    useAccessForm({ initialValues: INITIAL_VALUES, validate: validateValues, toFailure: () => 'failed' as const }),
  )

describe('useAccessForm', () => {
  it('empieza con los valores iniciales, sin errores y sin ningún intento', () => {
    // Arrange: formulario recién abierto

    // Act
    const { result } = setup()

    // Assert
    expect(result.current.values).toEqual(INITIAL_VALUES)
    expect(result.current.errors).toEqual({})
    expect(result.current.status).toBe('idle')
  })

  it('comprueba los campos y, al corregir uno, quita solo su error', () => {
    // Arrange
    const { result } = setup()
    let isValid = true
    act(() => {
      isValid = result.current.validateFields()
    })

    // Act
    act(() => result.current.change('email', 'ana@gmail.com'))

    // Assert
    expect(isValid).toBe(false)
    expect(result.current.errors.email).toBeUndefined()
    expect(result.current.errors.password).toBe('Escribe tu contraseña.')
  })

  it('al editar después de un intento fallido retira el aviso: ya no describe lo que hay escrito', async () => {
    // Arrange
    const { result } = setup()
    await act(() => result.current.attempt('submitting', () => Promise.reject(new Error('sin conexión'))))
    const statusAfterFailure = result.current.status

    // Act
    act(() => result.current.change('password', 'otra-clave'))

    // Assert
    expect(statusAfterFailure).toBe('failed')
    expect(result.current.status).toBe('idle')
  })
})
