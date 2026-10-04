import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PageHeader from '@/components/PageHeader'

describe('PageHeader', () => {
  it('pone el título como encabezado principal de la página', () => {
    // Arrange
    const title = 'Publica tu propiedad'

    // Act
    render(<PageHeader title={title} />)

    // Assert
    expect(screen.getByRole('heading', { level: 1, name: title })).toBeInTheDocument()
  })

  it('presenta la página con una frase cuando se le da una descripción', () => {
    // Arrange
    const description = 'Completa los datos del anuncio.'

    // Act
    render(<PageHeader title="Publica tu propiedad" description={description} />)

    // Assert
    expect(screen.getByText(description)).toBeInTheDocument()
  })

  it('sin descripción no deja un párrafo vacío', () => {
    // Arrange: solo el título

    // Act
    const { container } = render(<PageHeader title="Planes" />)

    // Assert
    expect(container.querySelector('p')).toBeNull()
  })
})
