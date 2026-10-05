import { screen } from '@testing-library/react'
import { LogIn } from 'lucide-react'
import { describe, expect, it } from 'vitest'
import AuthCard from '@/features/auth/components/AuthCard'
import { renderWithRouter } from '@/test/renderWithRouter'

const ALTERNATIVE = { question: '¿No tienes cuenta?', action: 'Regístrate', to: '/registro' }

const renderCard = () =>
  renderWithRouter(
    <AuthCard
      icon={LogIn}
      title="¡Bienvenido!"
      description="Inicia sesión para gestionar tus propiedades."
      alternative={ALTERNATIVE}
    >
      <input aria-label="Correo" />
    </AuthCard>,
  )

describe('AuthCard', () => {
  it('presenta la pantalla con su título principal y su explicación, y muestra su contenido', () => {
    // Arrange: tarjeta de inicio de sesión

    // Act
    renderCard()

    // Assert
    expect(screen.getByRole('heading', { level: 1, name: '¡Bienvenido!' })).toBeInTheDocument()
    expect(screen.getByText('Inicia sesión para gestionar tus propiedades.')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Correo' })).toBeInTheDocument()
  })

  it('ofrece al pie la otra pantalla, con la pregunta y el enlace separados por un espacio', () => {
    // Arrange
    const { question, action, to } = ALTERNATIVE

    // Act
    renderCard()

    // Assert
    expect(screen.getByText(question, { exact: false })).toHaveTextContent(`${question} ${action}`)
    expect(screen.getByRole('link', { name: action })).toHaveAttribute('href', to)
  })

  it('el icono de la cabecera es decorativo', () => {
    // Arrange: tarjeta con su icono

    // Act
    const { container } = renderCard()

    // Assert
    expect(container.querySelector('[data-slot="card-header"] svg')).toHaveAttribute('aria-hidden', 'true')
  })
})
