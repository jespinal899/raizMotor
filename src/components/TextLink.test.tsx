import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import TextLink from '@/components/TextLink'
import { renderWithRouter } from '@/test/renderWithRouter'

describe('TextLink', () => {
  it('es un enlace de verdad, que lleva a su destino', () => {
    // Arrange
    const destination = '/registro'

    // Act
    renderWithRouter(<TextLink to={destination}>Regístrate</TextLink>)

    // Assert
    expect(screen.getByRole('link', { name: 'Regístrate' })).toHaveAttribute('href', destination)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('se integra en una frase: no ocupa el alto ni el relleno de un botón', () => {
    // Arrange: enlace dentro de un texto

    // Act
    renderWithRouter(<TextLink to="/registro">Regístrate</TextLink>)

    // Assert
    expect(screen.getByRole('link', { name: 'Regístrate' })).toHaveClass('h-auto', 'p-0')
  })
})
