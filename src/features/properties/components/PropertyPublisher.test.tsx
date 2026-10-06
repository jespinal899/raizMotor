import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PropertyPublisher from '@/features/properties/components/PropertyPublisher'
import { buildProperty } from '@/test/factories'

describe('PropertyPublisher', () => {
  it('dice quién publica la propiedad y qué tipo de anunciante es', () => {
    // Arrange
    const property = buildProperty({ advertiser: { name: 'Inmobiliaria de prueba', kind: 'inmobiliaria' } })

    // Act
    render(<PropertyPublisher property={property} />)

    // Assert
    expect(screen.getByText('Publicado por')).toBeInTheDocument()
    expect(screen.getByText('Inmobiliaria de prueba')).toBeInTheDocument()
    expect(screen.getByText('Inmobiliaria')).toBeInTheDocument()
  })

  it('en un anuncio guardado en este navegador, dice que lo publicó quien lo está viendo', () => {
    // Arrange
    const property = buildProperty({ advertiser: undefined, localOnly: true })

    // Act
    render(<PropertyPublisher property={property} />)

    // Assert
    expect(screen.getByText('Publicado por')).toBeInTheDocument()
    expect(screen.getByText('Tú')).toBeInTheDocument()
    expect(screen.getByText('Desde este navegador')).toBeInTheDocument()
  })

  it('si no se sabe quién publica, no muestra el bloque', () => {
    // Arrange
    const property = buildProperty({ advertiser: undefined })

    // Act
    const { container } = render(<PropertyPublisher property={property} />)

    // Assert
    expect(container).toBeEmptyDOMElement()
  })

  it('el icono es un adorno', () => {
    // Arrange
    const property = buildProperty()

    // Act
    const { container } = render(<PropertyPublisher property={property} />)

    // Assert
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })
})
