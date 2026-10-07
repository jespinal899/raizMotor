import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PropertyDetailSection from '@/features/properties/components/PropertyDetailSection'

describe('PropertyDetailSection', () => {
  it('es una región que se llama como su título y contiene lo que se le pasa', () => {
    // Arrange
    const title = 'Descripción'

    // Act
    render(
      <PropertyDetailSection id="descripcion" title={title}>
        <p>Casa luminosa.</p>
      </PropertyDetailSection>,
    )

    // Assert
    const section = screen.getByRole('region', { name: title })
    expect(within(section).getByRole('heading', { level: 2, name: title })).toBeInTheDocument()
    expect(within(section).getByText('Casa luminosa.')).toBeInTheDocument()
  })

  it('el título va antes que el contenido', () => {
    // Arrange
    const title = 'Ubicación'

    // Act
    render(
      <PropertyDetailSection id="ubicacion" title={title}>
        <p>Colonia Trejo</p>
      </PropertyDetailSection>,
    )

    // Assert
    const heading = screen.getByRole('heading', { level: 2, name: title })
    expect(heading.compareDocumentPosition(screen.getByText('Colonia Trejo'))).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
  })
})
