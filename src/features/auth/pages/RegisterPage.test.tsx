import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import RegisterPage from '@/features/auth/pages/RegisterPage'
import { BRAND } from '@/shared/constants/brand'
import { renderWithRouter } from '@/test/renderWithRouter'

const renderPage = () => renderWithRouter(<RegisterPage />, { route: '/registro' })

describe('RegisterPage', () => {
  it('explica que el registro aún no está disponible, sin pedir datos que no se guardarían', () => {
    // Arrange: visitante que quiere crear una cuenta

    // Act
    renderPage()

    // Assert
    expect(screen.getByRole('heading', { level: 1, name: 'Crear una cuenta' })).toBeInTheDocument()
    expect(screen.getByText(/El registro aún no está disponible/)).toBeInTheDocument()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })

  it('ofrece volver al inicio de sesión o pedir ayuda', () => {
    // Arrange
    const expectedLinks = ['Volver a iniciar sesión → /iniciar-sesion', 'Contáctanos → /contacto']

    // Act
    renderPage()

    // Assert
    const links = screen.getAllByRole('link').map((link) => `${link.textContent} → ${link.getAttribute('href')}`)
    expect(links).toEqual(expectedLinks)
  })

  it('pone su título en la pestaña', async () => {
    // Arrange
    const expectedTitle = `Crear una cuenta | ${BRAND.name}`

    // Act
    renderPage()

    // Assert
    await waitFor(() => expect(document.title).toBe(expectedTitle))
  })
})
