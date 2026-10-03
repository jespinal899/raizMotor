import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PropertyDetailLayout from '@/features/properties/components/PropertyDetailLayout'

const renderLayout = () =>
  render(
    <PropertyDetailLayout
      aria-label="Ficha de prueba"
      breadcrumb={<nav aria-label="Ruta">Ruta</nav>}
      header={<h1>Título</h1>}
      gallery={<div>Fotos</div>}
      sidebar={<p>Precio</p>}
    >
      <p>Descripción</p>
    </PropertyDetailLayout>,
  )

describe('PropertyDetailLayout', () => {
  it('coloca cada bloque dentro de la ficha', () => {
    // Arrange: estructura con contenido de prueba en cada hueco

    // Act
    renderLayout()

    // Assert
    const article = screen.getByRole('article', { name: 'Ficha de prueba' })
    expect(within(article).getByRole('navigation', { name: 'Ruta' })).toBeInTheDocument()
    expect(within(article).getByRole('heading', { level: 1, name: 'Título' })).toBeInTheDocument()
    expect(within(article).getByText('Fotos')).toBeInTheDocument()
    expect(within(article).getByText('Descripción')).toBeInTheDocument()
  })

  it('pone la barra lateral en una región complementaria', () => {
    // Arrange: estructura con contenido de prueba en cada hueco

    // Act
    renderLayout()

    // Assert
    expect(within(screen.getByRole('complementary')).getByText('Precio')).toBeInTheDocument()
  })

  it('en el documento, la barra lateral va después de las fotos y antes de la descripción', () => {
    // Arrange: ese orden es el que se ve en móvil, donde todo se apila

    // Act
    renderLayout()

    // Assert
    const order = [screen.getByText('Fotos'), screen.getByText('Precio'), screen.getByText('Descripción')]
    const follows = (first: HTMLElement, second: HTMLElement) =>
      Boolean(first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING)
    expect(follows(order[0], order[1])).toBe(true)
    expect(follows(order[1], order[2])).toBe(true)
  })
})
