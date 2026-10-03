import { render, screen } from '@testing-library/react'
import { Compass } from 'lucide-react'
import { describe, expect, it } from 'vitest'
import PageMessage from '@/components/PageMessage'

describe('PageMessage', () => {
  it('usa el título como encabezado principal de la página', () => {
    // Arrange
    const title = 'No encontramos esta página'

    // Act
    render(<PageMessage icon={Compass} title={title} />)

    // Assert
    expect(screen.getByRole('heading', { level: 1, name: title })).toBeInTheDocument()
  })

  it('muestra la descripción y las acciones recibidas', () => {
    // Arrange
    const description = 'Puede que el enlace esté mal escrito.'

    // Act
    render(
      <PageMessage icon={Compass} title="Sin página" description={description}>
        <a href="/">Volver al inicio</a>
      </PageMessage>,
    )

    // Assert
    expect(screen.getByText(description)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Volver al inicio' })).toBeInTheDocument()
  })
})
