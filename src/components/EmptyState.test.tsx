import { render, screen } from '@testing-library/react'
import { SearchX } from 'lucide-react'
import { describe, expect, it } from 'vitest'
import EmptyState from '@/components/EmptyState'

describe('EmptyState', () => {
  it('muestra el título como encabezado de segundo nivel por defecto', () => {
    // Arrange
    const title = 'Sin resultados'

    // Act
    render(<EmptyState icon={SearchX} title={title} />)

    // Assert
    expect(screen.getByRole('heading', { level: 2, name: title })).toBeInTheDocument()
  })

  it('usa un encabezado principal cuando ocupa toda la página', () => {
    // Arrange
    const title = 'Página no encontrada'

    // Act
    render(<EmptyState icon={SearchX} title={title} titleAs="h1" />)

    // Assert
    expect(screen.getByRole('heading', { level: 1, name: title })).toBeInTheDocument()
  })

  it('muestra la descripción y las acciones recibidas', () => {
    // Arrange
    const description = 'Prueba con otros filtros.'

    // Act
    render(
      <EmptyState icon={SearchX} title="Sin resultados" description={description}>
        <button type="button">Reintentar</button>
      </EmptyState>,
    )

    // Assert
    expect(screen.getByText(description)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument()
  })

  it('oculta el icono decorativo a los lectores de pantalla', () => {
    // Arrange
    const title = 'Sin resultados'

    // Act
    const { container } = render(<EmptyState icon={SearchX} title={title} />)

    // Assert
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })
})
