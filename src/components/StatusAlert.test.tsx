import { render, screen } from '@testing-library/react'
import { Info } from 'lucide-react'
import { describe, expect, it } from 'vitest'
import StatusAlert from '@/components/StatusAlert'

describe('StatusAlert', () => {
  it('anuncia el título y la explicación como una alerta', () => {
    // Arrange
    const title = 'Algo salió mal'
    const description = 'Inténtalo de nuevo en unos minutos.'

    // Act
    render(<StatusAlert icon={Info} title={title} description={description} />)

    // Assert
    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent(title)
    expect(alert).toHaveTextContent(description)
  })

  it('un resultado que no es un problema se anuncia como estado, sin interrumpir', () => {
    // Arrange
    const title = 'Tu propiedad se publicó'

    // Act
    render(<StatusAlert icon={Info} title={title} description="Ya aparece en el catálogo." role="status" />)

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent(title)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('el icono es decorativo: no lo leen los lectores de pantalla', () => {
    // Arrange
    const title = 'Algo salió mal'

    // Act
    const { container } = render(<StatusAlert icon={Info} title={title} description="Reintenta." />)

    // Assert
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })

  it('una advertencia previa, que no es el resultado de ninguna acción, se presenta como nota', () => {
    // Arrange
    const title = 'El registro está en construcción'

    // Act
    render(<StatusAlert icon={Info} title={title} description="Aún no guarda tus datos." role="note" />)

    // Assert
    expect(screen.getByRole('note')).toHaveTextContent(title)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
