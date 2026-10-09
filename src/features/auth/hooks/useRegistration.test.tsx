import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { useRegistration } from '@/features/auth/hooks/useRegistration'
import { EmailTakenError } from '@/features/auth/services/authErrors'
import type { AuthService } from '@/features/auth/services/authService'
import { buildRegistration } from '@/test/factories'
import { fakeAuthService } from '@/test/fakeAuthService'
import { TEST_OPERATION_KEY } from '@/test/operationKey'
import { renderWithRouter } from '@/test/renderWithRouter'

const REGISTER_PATH = '/registro'
const REGISTRATION = buildRegistration()
const NO_CONFIRMATION = 'sin confirmación pendiente'

interface ProbeProps {
  service: AuthService
  onFailure: (reason: unknown) => void
}

const Probe = ({ service, onFailure }: ProbeProps) => {
  const { confirmationEmail, register, registerWithGoogle } = useRegistration(service)

  return (
    <>
      <output>{confirmationEmail ?? NO_CONFIRMATION}</output>
      <button type="button" onClick={() => void register(REGISTRATION, TEST_OPERATION_KEY).catch(onFailure)}>
        Registrar
      </button>
      <button type="button" onClick={() => void registerWithGoogle().catch(onFailure)}>
        Google
      </button>
    </>
  )
}

const setup = () => {
  const { service } = fakeAuthService()
  const onFailure = vi.fn()
  const view = renderWithRouter(<Probe service={service} onFailure={onFailure} />, {
    route: REGISTER_PATH,
    path: REGISTER_PATH,
  })

  return { ...view, service, onFailure, user: userEvent.setup() }
}

const confirmation = () => screen.getByRole('status')

describe('useRegistration', () => {
  it('al empezar no hay ninguna confirmación pendiente', () => {
    // Arrange: alguien que abre el registro

    // Act
    setup()

    // Assert
    expect(confirmation()).toHaveTextContent(NO_CONFIRMATION)
  })

  it('si la cuenta queda pendiente de confirmar, guarda a qué correo se envió el enlace y no cambia de página', async () => {
    // Arrange
    const { service, currentPath, user } = setup()
    service.register.mockResolvedValue('confirmationPending')

    // Act
    await user.click(screen.getByRole('button', { name: 'Registrar' }))

    // Assert
    await waitFor(() => expect(confirmation()).toHaveTextContent(REGISTRATION.email))
    expect(service.register).toHaveBeenCalledExactlyOnceWith(REGISTRATION, TEST_OPERATION_KEY)
    expect(currentPath()).toBe(REGISTER_PATH)
  })

  it('si la cuenta se crea con la sesión iniciada lleva al inicio, sin pedir que se confirme nada', async () => {
    // Arrange
    const { service, currentPath, user } = setup()
    service.register.mockResolvedValue('signedIn')

    // Act
    await user.click(screen.getByRole('button', { name: 'Registrar' }))

    // Assert
    await waitFor(() => expect(currentPath()).toBe('/'))
  })

  it('si el registro se rechaza entrega el motivo y no anuncia ningún correo', async () => {
    // Arrange
    const { service, onFailure, user } = setup()
    const reason = new EmailTakenError()
    service.register.mockRejectedValue(reason)

    // Act
    await user.click(screen.getByRole('button', { name: 'Registrar' }))

    // Assert
    await waitFor(() => expect(onFailure).toHaveBeenCalledExactlyOnceWith(reason))
    expect(confirmation()).toHaveTextContent(NO_CONFIRMATION)
  })

  it('registrarse con Google es entrar con Google: al completarse lleva al inicio', async () => {
    // Arrange
    const { service, currentPath, user } = setup()

    // Act
    await user.click(screen.getByRole('button', { name: 'Google' }))

    // Assert
    await waitFor(() => expect(currentPath()).toBe('/'))
    expect(service.loginWithGoogle).toHaveBeenCalledOnce()
    expect(service.register).not.toHaveBeenCalled()
  })
})
