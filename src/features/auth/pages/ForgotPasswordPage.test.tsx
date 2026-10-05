import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import ForgotPasswordPage from '@/features/auth/pages/ForgotPasswordPage'
import { BRAND } from '@/shared/constants/brand'
import { renderWithRouter } from '@/test/renderWithRouter'

const renderPage = () => renderWithRouter(<ForgotPasswordPage />, { route: '/recuperar-contrasena' })

describe('ForgotPasswordPage', () => {
  it('explica que recuperar la contraseña aún no está disponible, sin pedir un correo al que no se escribiría', () => {
    // Arrange: visitante que olvidó su contraseña

    // Act
    renderPage()

    // Assert
    expect(screen.getByRole('heading', { level: 1, name: 'Recuperar contraseña' })).toBeInTheDocument()
    expect(screen.getByText(/La recuperación de contraseña aún no está disponible/)).toBeInTheDocument()
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
    const expectedTitle = `Recuperar contraseña | ${BRAND.name}`

    // Act
    renderPage()

    // Assert
    await waitFor(() => expect(document.title).toBe(expectedTitle))
  })
})
