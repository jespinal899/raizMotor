import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import NotFoundPage from '@/pages/NotFoundPage'
import { BRAND } from '@/shared/constants/brand'
import { renderWithRouter } from '@/test/renderWithRouter'

describe('NotFoundPage', () => {
  it('explica que la página no existe', () => {
    // Arrange
    const route = '/esto-no-existe'

    // Act
    renderWithRouter(<NotFoundPage />, { route })

    // Assert
    expect(screen.getByRole('heading', { level: 1, name: 'No encontramos esta página' })).toBeInTheDocument()
  })

  it('ofrece volver al inicio o ver las propiedades', () => {
    // Arrange
    const route = '/esto-no-existe'

    // Act
    renderWithRouter(<NotFoundPage />, { route })

    // Assert
    expect(screen.getByRole('link', { name: 'Volver al inicio' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'Ver propiedades' })).toHaveAttribute('href', '/propiedades')
  })

  it('pone su título en la pestaña', () => {
    // Arrange
    const route = '/esto-no-existe'

    // Act
    renderWithRouter(<NotFoundPage />, { route })

    // Assert
    expect(document.title).toBe(`No encontramos esta página | ${BRAND.name}`)
  })
})
