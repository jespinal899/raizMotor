import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import ExternalButtonLink from '@/components/ExternalButtonLink'

describe('ExternalButtonLink', () => {
  it('es un enlace de verdad a la dirección indicada, con su texto como nombre', () => {
    // Arrange
    const href = 'https://example.com/ruta'

    // Act
    render(<ExternalButtonLink href={href}>Cómo llegar</ExternalButtonLink>)

    // Assert
    expect(screen.getByRole('link', { name: 'Cómo llegar' })).toHaveAttribute('href', href)
  })

  it('se abre en otra pestaña, sin dar a esa página acceso a esta', () => {
    // Arrange
    const href = 'https://example.com/ruta'

    // Act
    render(<ExternalButtonLink href={href}>Cómo llegar</ExternalButtonLink>)

    // Assert
    const link = screen.getByRole('link', { name: 'Cómo llegar' })
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('combina las clases recibidas con el estilo de botón', () => {
    // Arrange
    const extraClass = 'clase-extra'

    // Act
    render(
      <ExternalButtonLink href="https://example.com" className={extraClass}>
        Cómo llegar
      </ExternalButtonLink>,
    )

    // Assert
    expect(screen.getByRole('link', { name: 'Cómo llegar' })).toHaveClass(extraClass, 'bg-primary')
  })
})
