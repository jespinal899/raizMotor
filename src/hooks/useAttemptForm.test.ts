import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useAttemptForm } from '@/hooks/useAttemptForm'
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
    useAttemptForm<Values, 'submitting', 'failed', 'sent'>({
      initialValues: INITIAL_VALUES,
      validate: validateValues,
      toFailure: () => 'failed',
      succeeded: 'sent',
    }),
  )

describe('useAttemptForm', () => {
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

  it('cuando el intento termina bien queda en el estado de éxito que se le indicó', async () => {
    // Arrange
    const { result } = setup()

    // Act
    await act(() => result.current.attempt('submitting', () => Promise.resolve()))

    // Assert
    expect(result.current.status).toBe('sent')
  })

  it('al editar después de un envío correcto vuelve al reposo: lo escrito es otro envío', async () => {
    // Arrange
    const { result } = setup()
    await act(() => result.current.attempt('submitting', () => Promise.resolve()))

    // Act
    act(() => result.current.change('email', 'otra@gmail.com'))

    // Assert
    expect(result.current.status).toBe('idle')
  })
})
