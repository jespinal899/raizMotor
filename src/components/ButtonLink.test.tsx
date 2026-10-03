import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import ButtonLink from '@/components/ButtonLink'
import { renderWithRouter } from '@/test/renderWithRouter'

describe('ButtonLink', () => {
  it('es un enlace real que apunta a la ruta indicada', () => {
    // Arrange
    const destination = '/publicar'

    // Act
    renderWithRouter(<ButtonLink to={destination}>Publicar</ButtonLink>)

    // Assert
    expect(screen.getByRole('link', { name: 'Publicar' })).toHaveAttribute('href', destination)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('combina las clases recibidas con el estilo de botón', () => {
    // Arrange
    const extraClass = 'clase-extra'

    // Act
    renderWithRouter(
      <ButtonLink to="/contacto" className={extraClass}>
        Contacto
      </ButtonLink>,
    )

    // Assert
    const link = screen.getByRole('link', { name: 'Contacto' })
    expect(link).toHaveClass(extraClass, 'bg-primary')
  })

  it('con markCurrent señala el enlace de la página actual', () => {
    // Arrange
    const currentRoute = '/publicar'

    // Act
    renderWithRouter(
      <ButtonLink to="/publicar" markCurrent>
        Publicar
      </ButtonLink>,
      { route: currentRoute },
    )

    // Assert
    expect(screen.getByRole('link', { name: 'Publicar' })).toHaveAttribute('aria-current', 'page')
  })

  it('con markCurrent no señala un enlace a otra página', () => {
    // Arrange
    const currentRoute = '/contacto'

    // Act
    renderWithRouter(
      <ButtonLink to="/publicar" markCurrent>
        Publicar
      </ButtonLink>,
      { route: currentRoute },
    )

    // Assert
    expect(screen.getByRole('link', { name: 'Publicar' })).not.toHaveAttribute('aria-current')
  })

  it('sin markCurrent nunca señala la página actual', () => {
    // Arrange
    const currentRoute = '/publicar'

    // Act
    renderWithRouter(<ButtonLink to="/publicar">Publicar</ButtonLink>, { route: currentRoute })

    // Assert
    expect(screen.getByRole('link', { name: 'Publicar' })).not.toHaveAttribute('aria-current')
  })
})
