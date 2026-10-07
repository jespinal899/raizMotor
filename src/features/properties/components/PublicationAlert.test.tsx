import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PublicationAlert from '@/features/properties/components/PublicationAlert'

describe('PublicationAlert', () => {
  it.each(['idle', 'submitting'] as const)('no muestra nada en el estado "%s"', (status) => {
    // Arrange: todavía no hay resultado

    // Act
    const { container } = render(<PublicationAlert status={status} />)

    // Assert
    expect(container).toBeEmptyDOMElement()
  })

  it('confirma que el anuncio se guardó y aclara que solo está en este navegador', () => {
    // Arrange
    const status = 'published'

    // Act
    render(<PublicationAlert status={status} />)

    // Assert
    const message = screen.getByRole('status')
    expect(message).toHaveTextContent('Tu propiedad se guardó')
    expect(message).toHaveTextContent('Está en este navegador; otras personas todavía no pueden verla.')
  })

  it('si no se pudo guardar, lo dice y explica qué revisar', () => {
    // Arrange
    const status = 'failed'

    // Act
    render(<PublicationAlert status={status} />)

    // Assert
    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('No pudimos guardar tu propiedad')
    expect(alert).toHaveTextContent('Revisa que el navegador permita guardar datos de este sitio y vuelve a intentarlo.')
  })

  it('si ya se usó la publicación gratuita, lo dice y aclara que este anuncio no se guardó', () => {
    // Arrange
    const status = 'limitReached'

    // Act
    render(<PublicationAlert status={status} />)

    // Assert
    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('Ya usaste tu publicación gratuita')
    expect(alert).toHaveTextContent('El plan Propietario incluye una sola publicación. Este anuncio no se guardó.')
  })
})
