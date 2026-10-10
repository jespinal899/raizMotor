import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { adminService } from '@/features/admin/services/adminService'
import AccountMenu from '@/features/auth/components/AccountMenu'
import { authService } from '@/features/auth/services/authService'
import { deferred } from '@/test/deferred'
import { buildSessionUser } from '@/test/factories'
import { renderWithRouter } from '@/test/renderWithRouter'

vi.mock('@/features/auth/services/authService', () => ({ authService: { logout: vi.fn() } }))
vi.mock('@/features/admin/services/adminService', () => ({ adminService: { isAdmin: vi.fn(async () => false) } }))

const logout = vi.mocked(authService.logout)
const isAdmin = vi.mocked(adminService.isAdmin)

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
    isAdmin.mockReset().mockResolvedValue(false)
  })

  it('a una cuenta del equipo le ofrece el panel de administración', async () => {
    // Arrange
    isAdmin.mockResolvedValue(true)
    renderWithRouter(<AccountMenu user={USER} />)

    // Act
    await openMenu()

    // Assert
    expect(await screen.findByRole('menuitem', { name: 'Panel de administración' })).toHaveAttribute('href', '/admin')
  })

  it('a las demás cuentas no les ofrece el panel', async () => {
    // Arrange
    renderWithRouter(<AccountMenu user={USER} />)

    // Act
    await openMenu()

    // Assert
    await screen.findByRole('menuitem', { name: 'Mi cuenta' })
    expect(isAdmin).toHaveBeenCalled()
    expect(screen.queryByRole('menuitem', { name: 'Panel de administración' })).not.toBeInTheDocument()
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

  it.each([
    ['Mis publicaciones', '/mis-publicaciones'],
    ['Mi cuenta', '/mi-cuenta'],
  ])('lleva a «%s»', async (option, path) => {
    // Arrange
    renderWithRouter(<AccountMenu user={USER} />)

    // Act
    await openMenu()

    // Assert
    expect(await screen.findByRole('menuitem', { name: option })).toHaveAttribute('href', path)
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
