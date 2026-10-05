import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { useEnter } from '@/features/auth/hooks/useEnter'
import { renderWithRouter } from '@/test/renderWithRouter'

const ACCESS_PATH = '/iniciar-sesion'

interface ProbeProps {
  access: () => Promise<void>
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

const setup = (access: () => Promise<void>) => {
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
