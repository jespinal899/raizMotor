import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Breadcrumb from '@/components/Breadcrumb'
import type { BreadcrumbItem } from '@/components/Breadcrumb'
import { renderWithRouter } from '@/test/renderWithRouter'

const ITEMS: BreadcrumbItem[] = [
  { label: 'Inicio', to: '/' },
  { label: 'Propiedades', to: '/propiedades' },
  { label: 'Casa con jardín' },
]

describe('Breadcrumb', () => {
  it('enlaza cada nivel que tiene destino', () => {
    // Arrange
    const items = ITEMS

    // Act
    renderWithRouter(<Breadcrumb items={items} />)

    // Assert
    const links = screen.getAllByRole('link').map((link) => `${link.textContent} → ${link.getAttribute('href')}`)
    expect(links).toEqual(['Inicio → /', 'Propiedades → /propiedades'])
  })

  it('marca el nivel sin destino como la página actual', () => {
    // Arrange
    const items = ITEMS

    // Act
    renderWithRouter(<Breadcrumb items={items} />)

    // Assert
    const current = screen.getByText('Casa con jardín')
    expect(current).toHaveAttribute('aria-current', 'page')
    expect(current.closest('a')).toBeNull()
  })

  it('se anuncia como navegación con los niveles en orden', () => {
    // Arrange
    const items = ITEMS

    // Act
    renderWithRouter(<Breadcrumb items={items} />)

    // Assert
    const navigation = screen.getByRole('navigation', { name: 'Ruta de navegación' })
    const levels = within(navigation)
      .getAllByRole('listitem')
      .map((item) => item.textContent)
    expect(levels).toEqual(['Inicio', 'Propiedades', 'Casa con jardín'])
  })
})
