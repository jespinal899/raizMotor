import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import MobileNav from '@/components/layout/MobileNav'
import { renderWithRouter } from '@/test/renderWithRouter'

const openMenu = async () => {
  const user = userEvent.setup()
  await user.click(screen.getByRole('button', { name: 'Abrir menú' }))

  return { user, menu: await screen.findByRole('navigation', { name: 'Navegación móvil' }) }
}

describe('MobileNav', () => {
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
})
