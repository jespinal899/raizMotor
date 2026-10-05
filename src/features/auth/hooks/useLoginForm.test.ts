import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useLoginForm } from '@/features/auth/hooks/useLoginForm'
import { AuthUnavailableError, InvalidCredentialsError } from '@/features/auth/services/authService'
import type { LoginCredentials } from '@/features/auth/types/auth.types'
import { deferred } from '@/test/deferred'

type Submit = (credentials: LoginCredentials) => Promise<void>
type GoogleSignIn = () => Promise<void>

interface Handlers {
  onSubmit?: Submit
  onGoogleSignIn?: GoogleSignIn
}

const setup = ({
  onSubmit = vi.fn<Submit>(async () => {}),
  onGoogleSignIn = vi.fn<GoogleSignIn>(async () => {}),
}: Handlers = {}) => {
  const view = renderHook(() => useLoginForm({ onSubmit, onGoogleSignIn }))
  return { onSubmit, onGoogleSignIn, ...view }
}

const fillCredentials = (result: ReturnType<typeof setup>['result']) => {
  act(() => result.current.change('email', 'ana@gmail.com'))
  act(() => result.current.change('password', 'secreta123'))
}

describe('useLoginForm', () => {
  it('empieza vacío, sin recordar la sesión, sin errores y sin resultado', () => {
    // Arrange: formulario recién abierto

    // Act
    const { result } = setup()

    // Assert
    expect(result.current.values).toEqual({ email: '', password: '', remember: false })
    expect(result.current.errors).toEqual({})
    expect(result.current.status).toBe('idle')
  })

  it('no envía y muestra los errores si faltan datos', async () => {
    // Arrange
    const { result, onSubmit } = setup()

    // Act
    await act(() => result.current.submit())

    // Assert
    expect(onSubmit).not.toHaveBeenCalled()
    expect(result.current.errors).toEqual({ email: 'Escribe tu correo.', password: 'Escribe tu contraseña.' })
    expect(result.current.status).toBe('idle')
  })

  it('envía el correo sin espacios sobrantes y la contraseña tal como se escribió', async () => {
    // Arrange
    const { result, onSubmit } = setup()
    act(() => result.current.change('email', '  ana@gmail.com '))
    act(() => result.current.change('password', ' secreta 123 '))
    act(() => result.current.change('remember', true))

    // Act
    await act(() => result.current.submit())

    // Assert
    expect(onSubmit).toHaveBeenCalledExactlyOnceWith({
      email: 'ana@gmail.com',
      password: ' secreta 123 ',
      remember: true,
    })
  })

  it('mientras el inicio de sesión está en curso lo indica, y al terminar bien no deja ningún aviso', async () => {
    // Arrange
    const { promise, finish } = deferred()
    const { result } = setup({ onSubmit: () => promise })
    fillCredentials(result)

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
    { reason: new AuthUnavailableError(), status: 'unavailable', when: 'las cuentas aún no están activas' },
    { reason: new InvalidCredentialsError(), status: 'rejected', when: 'las credenciales no son correctas' },
    { reason: new Error('sin conexión'), status: 'failed', when: 'ocurre cualquier otro error' },
  ])('queda como "$status" cuando $when', async ({ reason, status }) => {
    // Arrange
    const { result } = setup({ onSubmit: () => Promise.reject(reason) })
    fillCredentials(result)

    // Act
    await act(() => result.current.submit())

    // Assert
    expect(result.current.status).toBe(status)
  })

  it('al corregir un campo quita solo su error', async () => {
    // Arrange
    const { result } = setup()
    await act(() => result.current.submit())

    // Act
    act(() => result.current.change('email', 'ana@gmail.com'))

    // Assert
    expect(result.current.errors.email).toBeUndefined()
    expect(result.current.errors.password).toBe('Escribe tu contraseña.')
  })

  it('al editar después de un intento fallido retira el aviso', async () => {
    // Arrange
    const { result } = setup({ onSubmit: () => Promise.reject(new InvalidCredentialsError()) })
    fillCredentials(result)
    await act(() => result.current.submit())

    // Act
    act(() => result.current.change('password', 'otra-clave'))

    // Assert
    expect(result.current.status).toBe('idle')
  })
})

describe('useLoginForm: entrar con Google', () => {
  it('no exige correo ni contraseña, ni los marca como errores', async () => {
    // Arrange
    const { result, onGoogleSignIn, onSubmit } = setup()

    // Act
    await act(() => result.current.signInWithGoogle())

    // Assert
    expect(onGoogleSignIn).toHaveBeenCalledOnce()
    expect(onSubmit).not.toHaveBeenCalled()
    expect(result.current.errors).toEqual({})
  })

  it('mientras conecta con Google lo indica, y al terminar bien no deja ningún aviso', async () => {
    // Arrange
    const { promise, finish } = deferred()
    const { result } = setup({ onGoogleSignIn: () => promise })

    // Act
    let connection: Promise<void> = Promise.resolve()
    act(() => {
      connection = result.current.signInWithGoogle()
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
    const { result } = setup({ onGoogleSignIn: () => Promise.reject(reason) })

    // Act
    await act(() => result.current.signInWithGoogle())

    // Assert
    expect(result.current.status).toBe(status)
  })
})

describe('useLoginForm: repetir no inicia dos sesiones', () => {
  it('enviar dos veces seguidas, con el primer envío aún en curso, pide entrar una sola vez', async () => {
    // Arrange
    const { promise, finish } = deferred()
    const onSubmit = vi.fn<Submit>(() => promise)
    const { result } = setup({ onSubmit })
    fillCredentials(result)

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
  })

  it('pulsar Google mientras se entra con correo no abre una segunda vía', async () => {
    // Arrange
    const { promise, finish } = deferred()
    const onGoogleSignIn = vi.fn<GoogleSignIn>(async () => {})
    const { result } = setup({ onSubmit: () => promise, onGoogleSignIn })
    fillCredentials(result)

    // Act
    let submission: Promise<void> = Promise.resolve()
    let connection: Promise<void> = Promise.resolve()
    act(() => {
      submission = result.current.submit()
      connection = result.current.signInWithGoogle()
    })
    await act(async () => {
      finish()
      await Promise.all([submission, connection])
    })

    // Assert
    expect(onGoogleSignIn).not.toHaveBeenCalled()
  })
})
