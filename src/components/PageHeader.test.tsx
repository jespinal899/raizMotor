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

  it('resalta en el color de la marca el final del título, que sigue leyéndose como un solo encabezado', () => {
    // Arrange
    const highlight = 'simples pasos'

    // Act
    render(<PageHeader title="Publica tu propiedad en" highlight={highlight} />)

    // Assert
    expect(screen.getByRole('heading', { level: 1, name: 'Publica tu propiedad en simples pasos' })).toBeInTheDocument()
    expect(screen.getByText(highlight)).toHaveClass('text-primary')
  })

  it('sin final resaltado, el título va entero en su color', () => {
    // Arrange: solo el título

    // Act
    const { container } = render(<PageHeader title="Planes" />)

    // Assert
    expect(container.querySelector('h1 span')).toBeNull()
  })

  it('centrado, alinea al centro el título y su descripción', () => {
    // Arrange
    const description = 'Elige el plan que mejor se adapte a tus necesidades.'

    // Act
    render(<PageHeader title="Planes" description={description} centered />)

    // Assert
    expect(screen.getByRole('heading', { level: 1 }).closest('header')).toHaveClass('mx-auto', 'text-center')
  })

  it('si no se pide otra cosa, se alinea al inicio como el resto de la página', () => {
    // Arrange: solo el título

    // Act
    render(<PageHeader title="Planes" />)

    // Assert
    expect(screen.getByRole('heading', { level: 1 }).closest('header')).not.toHaveClass('text-center')
  })
})
