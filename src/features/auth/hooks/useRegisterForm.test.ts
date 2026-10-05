import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useRegisterForm } from '@/features/auth/hooks/useRegisterForm'
import { AuthUnavailableError, RegistrationUnavailableError } from '@/features/auth/services/authService'
import type { RegistrationCredentials } from '@/features/auth/types/auth.types'
import { deferred } from '@/test/deferred'
import { buildRegistration } from '@/test/factories'

type Submit = (credentials: RegistrationCredentials) => Promise<void>
type GoogleSignUp = () => Promise<void>

interface Handlers {
  onSubmit?: Submit
  onGoogleSignUp?: GoogleSignUp
}

const setup = ({
  onSubmit = vi.fn<Submit>(async () => {}),
  onGoogleSignUp = vi.fn<GoogleSignUp>(async () => {}),
}: Handlers = {}) => {
  const view = renderHook(() => useRegisterForm({ onSubmit, onGoogleSignUp }))
  return { onSubmit, onGoogleSignUp, ...view }
}

const fill = (result: ReturnType<typeof setup>['result'], registration = buildRegistration()) => {
  for (const field of ['firstName', 'lastName', 'email', 'phone', 'password'] as const) {
    act(() => result.current.change(field, registration[field]))
  }
}

describe('useRegisterForm', () => {
  it('empieza vacío, sin errores y sin resultado', () => {
    // Arrange: formulario recién abierto

    // Act
    const { result } = setup()

    // Assert
    expect(result.current.values).toEqual({ firstName: '', lastName: '', email: '', phone: '', password: '' })
    expect(result.current.errors).toEqual({})
    expect(result.current.status).toBe('idle')
  })

  it('no envía y muestra los errores si faltan datos', async () => {
    // Arrange
    const { result, onSubmit } = setup()
    fill(result, buildRegistration({ email: '', password: '' }))

    // Act
    await act(() => result.current.submit())

    // Assert
    expect(onSubmit).not.toHaveBeenCalled()
    expect(result.current.errors).toMatchObject({ email: 'Escribe tu correo.', password: 'Escribe tu contraseña.' })
    expect(result.current.status).toBe('idle')
  })

  it('envía el perfil sin espacios sobrantes, el teléfono con su prefijo y la contraseña tal como se escribió', async () => {
    // Arrange
    const { result, onSubmit } = setup()
    fill(result, {
      firstName: '  Ana ',
      lastName: ' Mejía  ',
      email: ' ana@gmail.com ',
      phone: '9999-8888',
      password: ' secreta 123 ',
    })

    // Act
    await act(() => result.current.submit())

    // Assert
    expect(onSubmit).toHaveBeenCalledExactlyOnceWith({
      firstName: 'Ana',
      lastName: 'Mejía',
      email: 'ana@gmail.com',
      phone: '+50499998888',
      password: ' secreta 123 ',
    })
  })

  it('mientras se crea la cuenta lo indica, y al terminar bien no deja ningún aviso', async () => {
    // Arrange
    const { promise, finish } = deferred()
    const { result } = setup({ onSubmit: () => promise })
    fill(result)

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
    expect(result.current.status).toBe('idle')
  })

  it.each([
    { reason: new RegistrationUnavailableError(), status: 'unavailable', when: 'el registro aún no está activo' },
    { reason: new Error('sin conexión'), status: 'failed', when: 'ocurre cualquier otro error' },
  ])('queda como "$status" cuando $when', async ({ reason, status }) => {
    // Arrange
    const { result } = setup({ onSubmit: () => Promise.reject(reason) })
    fill(result)

    // Act
    await act(() => result.current.submit())

    // Assert
    expect(result.current.status).toBe(status)
  })

  it('al editar después de un intento fallido retira el aviso', async () => {
    // Arrange
    const { result } = setup({ onSubmit: () => Promise.reject(new RegistrationUnavailableError()) })
    fill(result)
    await act(() => result.current.submit())

    // Act
    act(() => result.current.change('phone', '8888-8888'))

    // Assert
    expect(result.current.status).toBe('idle')
  })
})

describe('useRegisterForm: registrarse con Google', () => {
  it('no exige ningún dato del formulario, ni los marca como errores', async () => {
    // Arrange
    const { result, onGoogleSignUp, onSubmit } = setup()

    // Act
    await act(() => result.current.signUpWithGoogle())

    // Assert
    expect(onGoogleSignUp).toHaveBeenCalledOnce()
    expect(onSubmit).not.toHaveBeenCalled()
    expect(result.current.errors).toEqual({})
  })

  it('mientras conecta con Google lo indica, y al terminar bien no deja ningún aviso', async () => {
    // Arrange
    const { promise, finish } = deferred()
    const { result } = setup({ onGoogleSignUp: () => promise })

    // Act
    let connection: Promise<void> = Promise.resolve()
    act(() => {
      connection = result.current.signUpWithGoogle()
    })
    const statusWhileConnecting = result.current.status
    await act(async () => {
      finish()
      await connection
    })

    // Assert
    expect(statusWhileConnecting).toBe('connecting')
    expect(result.current.status).toBe('idle')
  })

  it.each([
    { reason: new AuthUnavailableError(), status: 'unavailable', when: 'el acceso con Google aún no está activo' },
    { reason: new Error('ventana cerrada'), status: 'failed', when: 'ocurre cualquier otro error' },
  ])('queda como "$status" cuando $when', async ({ reason, status }) => {
    // Arrange
    const { result } = setup({ onGoogleSignUp: () => Promise.reject(reason) })

    // Act
    await act(() => result.current.signUpWithGoogle())

    // Assert
    expect(result.current.status).toBe(status)
  })
})
