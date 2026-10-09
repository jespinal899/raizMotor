import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import MobileNav from '@/components/layout/MobileNav'
import { authService } from '@/features/auth/services/authService'
import { buildSessionUser } from '@/test/factories'
import { renderWithRouter } from '@/test/renderWithRouter'
import { sessionIs } from '@/test/session'

vi.mock('@/features/auth/services/authService', () => ({
  authService: { logout: vi.fn(), onSessionChange: vi.fn() },
}))

const openMenu = async () => {
  const user = userEvent.setup()
  await user.click(screen.getByRole('button', { name: 'Abrir menú' }))

  return { user, menu: await screen.findByRole('navigation', { name: 'Navegación móvil' }) }
}

describe('MobileNav', () => {
  beforeEach(() => {
    vi.mocked(authService.onSessionChange).mockReset()
    vi.mocked(authService.logout).mockReset()
  })

  it('lleva a la sección "Quiénes somos" de la portada', async () => {
    // Arrange
    renderWithRouter(<MobileNav />, { route: '/contacto' })

    // Act
    const { menu } = await openMenu()

    // Assert
    expect(within(menu).getByRole('link', { name: 'Quiénes somos' })).toHaveAttribute('href', '/#quienes-somos')
  })

  it('al elegir "Quiénes somos" cierra el menú, para dejar ver la sección', async () => {
    // Arrange
    renderWithRouter(<MobileNav />)
    const { user, menu } = await openMenu()

    // Act
    await user.click(within(menu).getByRole('link', { name: 'Quiénes somos' }))

    // Assert
    expect(screen.queryByRole('navigation', { name: 'Navegación móvil' })).not.toBeInTheDocument()
  })

  it('sin sesión ofrece iniciar sesión', async () => {
    // Arrange
    sessionIs(null)
    renderWithRouter(<MobileNav />)

    // Act
    await openMenu()

    // Assert
    const sheet = within(screen.getByRole('dialog'))
    expect(sheet.getByRole('link', { name: 'Iniciar sesión' })).toHaveAttribute('href', '/iniciar-sesion')
    expect(sheet.queryByRole('button', { name: 'Cerrar sesión' })).not.toBeInTheDocument()
  })

  it('con sesión dice de quién es la cuenta en lugar de ofrecer iniciar sesión', async () => {
    // Arrange
    sessionIs(buildSessionUser({ firstName: 'Ana', lastName: 'Mejía', email: 'ana@gmail.com' }))
    renderWithRouter(<MobileNav />)

    // Act
    await openMenu()

    // Assert
    const sheet = within(screen.getByRole('dialog'))
    expect(sheet.getByText('Ana Mejía')).toBeInTheDocument()
    expect(sheet.getByText('ana@gmail.com')).toBeInTheDocument()
    expect(sheet.queryByRole('link', { name: 'Iniciar sesión' })).not.toBeInTheDocument()
  })

  it('con sesión permite cerrarla desde el menú', async () => {
    // Arrange
    sessionIs(buildSessionUser())
    vi.mocked(authService.logout).mockResolvedValue(undefined)
    renderWithRouter(<MobileNav />)
    const { user } = await openMenu()

    // Act
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Cerrar sesión' }))

    // Assert
    expect(authService.logout).toHaveBeenCalledOnce()
  })
})
