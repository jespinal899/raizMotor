import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { useEnter } from '@/features/auth/hooks/useEnter'
import type { RegistrationOutcome } from '@/features/auth/types/auth.types'
import { renderWithRouter } from '@/test/renderWithRouter'

const ACCESS_PATH = '/iniciar-sesion'

type Access = () => Promise<RegistrationOutcome | void>

interface ProbeProps {
  access: Access
  onFailure: (reason: unknown) => void
}

const Probe = ({ access, onFailure }: ProbeProps) => {
  const enter = useEnter()

  return (
    <button type="button" onClick={() => void enter(access).catch(onFailure)}>
      Entrar
    </button>
  )
}

const setup = (access: Access) => {
  const onFailure = vi.fn()
  const view = renderWithRouter(<Probe access={access} onFailure={onFailure} />, {
    route: ACCESS_PATH,
    path: ACCESS_PATH,
  })

  return { ...view, onFailure, user: userEvent.setup() }
}

describe('useEnter', () => {
  it('cuando el acceso se completa lleva al inicio', async () => {
    // Arrange
    const { currentPath, user } = setup(() => Promise.resolve())

    // Act
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    // Assert
    await waitFor(() => expect(currentPath()).toBe('/'))
  })

  it('cuando la cuenta se crea con la sesión iniciada lleva al inicio', async () => {
    // Arrange
    const { currentPath, user } = setup(() => Promise.resolve('signedIn'))

    // Act
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    // Assert
    await waitFor(() => expect(currentPath()).toBe('/'))
  })

  it('si falta confirmar el correo no lleva al inicio: la persona aún no está dentro', async () => {
    // Arrange
    const access = vi.fn<Access>(() => Promise.resolve('confirmationPending'))
    const { currentPath, onFailure, user } = setup(access)

    // Act
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    // Assert
    await waitFor(() => expect(access).toHaveBeenCalledOnce())
    expect(currentPath()).toBe(ACCESS_PATH)
    expect(onFailure).not.toHaveBeenCalled()
  })

  it('si el acceso falla no cambia de página y entrega el motivo, para poder explicarlo', async () => {
    // Arrange
    const reason = new Error('sin conexión')
    const { currentPath, onFailure, user } = setup(() => Promise.reject(reason))

    // Act
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    // Assert
    await waitFor(() => expect(onFailure).toHaveBeenCalledExactlyOnceWith(reason))
    expect(currentPath()).toBe(ACCESS_PATH)
  })
})
