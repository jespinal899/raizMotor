import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Footer from '@/components/layout/Footer'
import { BRAND } from '@/shared/constants/brand'
import { renderWithRouter } from '@/test/renderWithRouter'

const linksOf = (sectionName: string) =>
  within(screen.getByRole('navigation', { name: sectionName }))
    .getAllByRole('link')
    .map((link) => `${link.textContent} → ${link.getAttribute('href')}`)

describe('Footer', () => {
  it('muestra el logo y el lema de la marca', () => {
    // Arrange: footer sin estado previo

    // Act
    renderWithRouter(<Footer />)

    // Assert
    const footer = screen.getByRole('contentinfo')
    expect(within(footer).getByRole('link', { name: `${BRAND.name}, ir al inicio` })).toHaveAttribute('href', '/')
    expect(within(footer).getByText(BRAND.tagline)).toBeInTheDocument()
  })

  it('enlaza a todas las propiedades y a cada tipo', () => {
    // Arrange: footer sin estado previo

    // Act
    renderWithRouter(<Footer />)

    // Assert
    expect(linksOf('Propiedades')).toEqual([
      'Todas las propiedades → /propiedades',
      'Terrenos → /propiedades/terrenos',
      'Casas → /propiedades/casas',
      'Apartamentos → /propiedades/apartamentos',
    ])
  })

  it('enlaza a las páginas de la plataforma y de ayuda', () => {
    // Arrange: footer sin estado previo

    // Act
    renderWithRouter(<Footer />)

    // Assert
    expect(linksOf('Plataforma')).toEqual([
      'Quiénes somos → /#quienes-somos',
      'Cómo funciona → /#como-funciona',
      'Planes → /planes',
      'Publicar → /publicar',
    ])
    expect(linksOf('Ayuda')).toEqual(['Contáctenos → /contacto', 'Iniciar sesión → /iniciar-sesion'])
  })

  it('muestra el aviso de derechos con el año en curso', () => {
    // Arrange
    const year = new Date().getFullYear()

    // Act
    renderWithRouter(<Footer />)

    // Assert
    expect(screen.getByText(`© ${year} ${BRAND.name}. Todos los derechos reservados.`)).toBeInTheDocument()
  })
})
