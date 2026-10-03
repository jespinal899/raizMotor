import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Container from '@/components/layout/Container'

describe('Container', () => {
  it('aplica el ancho máximo y los márgenes comunes de las páginas', () => {
    // Arrange
    const content = 'Contenido'

    // Act
    render(<Container>{content}</Container>)

    // Assert
    expect(screen.getByText(content)).toHaveClass('mx-auto', 'max-w-7xl', 'px-4')
  })

  it('renderiza un div por defecto', () => {
    // Arrange
    const content = 'Contenido'

    // Act
    render(<Container>{content}</Container>)

    // Assert
    expect(screen.getByText(content).tagName).toBe('DIV')
  })

  it('puede renderizarse como otra etiqueta semántica y conserva sus atributos', () => {
    // Arrange
    const label = 'Destacadas'

    // Act
    render(
      <Container as="section" aria-label={label}>
        Contenido
      </Container>,
    )

    // Assert
    expect(screen.getByRole('region', { name: label }).tagName).toBe('SECTION')
  })

  it('las clases recibidas sustituyen a las propias cuando chocan', () => {
    // Arrange
    const narrower = 'max-w-2xl py-16'

    // Act
    render(<Container className={narrower}>Contenido</Container>)

    // Assert
    const container = screen.getByText('Contenido')
    expect(container).toHaveClass('max-w-2xl', 'py-16', 'mx-auto')
    expect(container).not.toHaveClass('max-w-7xl')
  })
})
