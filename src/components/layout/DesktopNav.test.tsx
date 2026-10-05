import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import DesktopNav from '@/components/layout/DesktopNav'
import { renderWithRouter } from '@/test/renderWithRouter'

const menu = () => screen.getByRole('navigation', { name: 'Navegación principal' })

describe('DesktopNav', () => {
  it('lleva a la sección "Quiénes somos" de la portada', () => {
    // Arrange
    const sectionLink = '/#quienes-somos'

    // Act
    renderWithRouter(<DesktopNav />, { route: '/contacto' })

    // Assert
    expect(within(menu()).getByRole('link', { name: 'Quiénes somos' })).toHaveAttribute('href', sectionLink)
  })

  it('ofrece "Quiénes somos" entre las propiedades y el contacto', () => {
    // Arrange
    const expectedOrder = ['Inicio', 'Quiénes somos', 'Contáctenos']

    // Act
    renderWithRouter(<DesktopNav />)

    // Assert
    const labels = within(menu())
      .getAllByRole('link')
      .map((link) => link.textContent)
    expect(labels).toEqual(expectedOrder)
  })

  it('en la portada solo "Inicio" figura como página actual: "Quiénes somos" es una sección de ella', () => {
    // Arrange
    const home = '/'

    // Act
    renderWithRouter(<DesktopNav />, { route: home })

    // Assert
    expect(within(menu()).getByRole('link', { name: 'Inicio' })).toHaveAttribute('aria-current', 'page')
    expect(within(menu()).getByRole('link', { name: 'Quiénes somos' })).not.toHaveAttribute('aria-current')
  })
})
