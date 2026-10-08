import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import BackLink from '@/components/BackLink'
import { renderWithRouter } from '@/test/renderWithRouter'

describe('BackLink', () => {
  it('es un enlace a la página anterior del recorrido, con su texto como nombre', () => {
    // Arrange
    const destination = '/planes'

    // Act
    renderWithRouter(<BackLink to={destination}>Ver todos los planes</BackLink>)

    // Assert
    expect(screen.getByRole('link', { name: 'Ver todos los planes' })).toHaveAttribute('href', destination)
  })

  it('lleva una flecha de adorno, que los lectores de pantalla no anuncian', () => {
    // Arrange: enlace para volver

    // Act
    renderWithRouter(<BackLink to="/planes">Ver todos los planes</BackLink>)

    // Assert
    const arrow = screen.getByRole('link', { name: 'Ver todos los planes' }).querySelector('svg')
    expect(arrow).toHaveAttribute('aria-hidden', 'true')
  })
})
