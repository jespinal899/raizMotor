import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import AuthCard from '@/features/auth/components/AuthCard'
import { renderWithRouter } from '@/test/renderWithRouter'

const ALTERNATIVE = { question: '¿No tienes cuenta?', action: 'Regístrate', to: '/registro' }

const renderCard = () =>
  renderWithRouter(
    <AuthCard
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

  it('ofrece la otra pantalla debajo del contenido, con la pregunta y el enlace separados por un espacio', () => {
    // Arrange
    const { question, action, to } = ALTERNATIVE

    // Act
    renderCard()

    // Assert
    expect(screen.getByText(question, { exact: false })).toHaveTextContent(`${question} ${action}`)
    expect(screen.getByRole('link', { name: action })).toHaveAttribute('href', to)
  })

  it('acompaña el contenido con una foto decorativa, que los lectores de pantalla no anuncian', () => {
    // Arrange: tarjeta con su foto lateral

    // Act
    const { container } = renderCard()

    // Assert
    expect(container.querySelector('img')).toHaveAttribute('alt', '')
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('solo pide la foto desde el ancho en que se muestra: en móviles no gasta datos en ella', () => {
    // Arrange
    const widthFromWhichItShows = '(min-width: 768px)'

    // Act
    const { container } = renderCard()

    // Assert
    const source = container.querySelector('picture source')
    expect(source).toHaveAttribute('media', widthFromWhichItShows)
    expect(source).toHaveAttribute('srcset', expect.stringContaining('https://'))
    expect(container.querySelector('picture img')).toHaveAttribute('src', expect.stringMatching(/^data:image\//))
  })
})
