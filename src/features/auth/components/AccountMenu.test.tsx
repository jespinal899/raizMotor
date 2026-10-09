import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AccountMenu from '@/features/auth/components/AccountMenu'
import { authService } from '@/features/auth/services/authService'
import { deferred } from '@/test/deferred'
import { buildSessionUser } from '@/test/factories'
import { renderWithRouter } from '@/test/renderWithRouter'

vi.mock('@/features/auth/services/authService', () => ({ authService: { logout: vi.fn() } }))

const logout = vi.mocked(authService.logout)

const USER = buildSessionUser({ firstName: 'Ana', lastName: 'Mejía', email: 'ana@gmail.com' })

const trigger = () => screen.getByRole('button', { name: 'Cuenta de Ana' })
const logoutOption = () => screen.findByRole('menuitem', { name: /Cerrar sesión|Cerrando sesión/ })

const openMenu = async () => {
  const user = userEvent.setup()
  await user.click(trigger())

  return user
}

describe('AccountMenu', () => {
  beforeEach(() => {
    logout.mockReset()
  })

  it('muestra en la barra el nombre de quien tiene la sesión', () => {
    // Arrange: Ana tiene la sesión abierta

    // Act
    renderWithRouter(<AccountMenu user={USER} />)

    // Assert
    expect(trigger()).toHaveTextContent('Ana')
  })

  it('al abrirlo dice de quién es la cuenta, con su nombre completo y su correo', async () => {
    // Arrange
    renderWithRouter(<AccountMenu user={USER} />)

    // Act
    await openMenu()

    // Assert
    const menu = await screen.findByRole('menu')
    expect(menu).toHaveTextContent('Ana Mejía')
    expect(menu).toHaveTextContent('ana@gmail.com')
  })

  it('lleva a los anuncios de la cuenta', async () => {
    // Arrange
    renderWithRouter(<AccountMenu user={USER} />)

    // Act
    await openMenu()

    // Assert
    expect(await screen.findByRole('menuitem', { name: 'Mis anuncios' })).toHaveAttribute('href', '/mis-anuncios')
  })

  it('«Cerrar sesión» cierra la sesión', async () => {
    // Arrange
    logout.mockResolvedValue(undefined)
    renderWithRouter(<AccountMenu user={USER} />)
    const user = await openMenu()

    // Act
    await user.click(await logoutOption())

    // Assert
    expect(logout).toHaveBeenCalledOnce()
  })

  it('mientras se cierra la sesión lo indica y no deja pedirlo otra vez', async () => {
    // Arrange
    const { promise, finish } = deferred()
    logout.mockReturnValue(promise)
    renderWithRouter(<AccountMenu user={USER} />)
    const user = await openMenu()

    // Act
    await user.click(await logoutOption())

    // Assert
    const option = await logoutOption()
    expect(option).toHaveTextContent('Cerrando sesión…')
    expect(option).toHaveAttribute('aria-disabled', 'true')
    finish()
  })

  it('si no se pudo cerrar la sesión lo avisa, y la opción sigue ahí para reintentar', async () => {
    // Arrange
    logout.mockRejectedValue(new Error('sin conexión'))
    renderWithRouter(<AccountMenu user={USER} />)
    const user = await openMenu()

    // Act
    await user.click(await logoutOption())

    // Assert
    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos cerrar tu sesión. Inténtalo de nuevo.')
    expect(await logoutOption()).toHaveTextContent('Cerrar sesión')
  })
})
