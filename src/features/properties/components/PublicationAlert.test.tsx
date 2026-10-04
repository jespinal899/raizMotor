import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PublicationAlert from '@/features/properties/components/PublicationAlert'
import { BRAND } from '@/shared/constants/brand'

describe('PublicationAlert', () => {
  it.each(['idle', 'submitting'] as const)('no muestra nada en el estado "%s"', (status) => {
    // Arrange: todavía no hay resultado

    // Act
    const { container } = render(<PublicationAlert status={status} />)

    // Assert
    expect(container).toBeEmptyDOMElement()
  })

  it('confirma la publicación solo cuando el anuncio se publicó', () => {
    // Arrange
    const status = 'published'

    // Act
    render(<PublicationAlert status={status} />)

    // Assert
    const message = screen.getByRole('status')
    expect(message).toHaveTextContent('Tu propiedad se publicó')
    expect(message).toHaveTextContent(`Ya aparece en el catálogo de ${BRAND.name}.`)
  })

  it('cuando la publicación aún no está activa lo dice y aclara que el anuncio no se envió', () => {
    // Arrange
    const status = 'unavailable'

    // Act
    render(<PublicationAlert status={status} />)

    // Assert
    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('La publicación aún no está disponible')
    expect(alert).toHaveTextContent('Tu anuncio no se envió')
    expect(alert).not.toHaveTextContent('se publicó')
  })

  it('ante un fallo del servicio invita a reintentar', () => {
    // Arrange
    const status = 'failed'

    // Act
    render(<PublicationAlert status={status} />)

    // Assert
    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('No pudimos publicar tu propiedad')
    expect(alert).toHaveTextContent('Inténtalo de nuevo en unos minutos.')
  })
})
