import { render, screen } from '@testing-library/react'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import HomePage from '@/pages/HomePage'
import { BRAND } from '@/shared/constants/brand'
import { PASSWORD_UPDATED_NOTICE } from '@/shared/constants/notices'
import { renderWithRouter } from '@/test/renderWithRouter'

describe('HomePage', () => {
  it('presenta quiénes somos antes de explicar cómo ayuda la plataforma', () => {
    // Arrange
    const helpSection = `En ${BRAND.name} te ayudamos`

    // Act
    renderWithRouter(<HomePage />)

    // Assert
    const about = screen.getByRole('region', { name: 'Quiénes somos' })
    const help = screen.getByRole('region', { name: helpSection })
    expect(about.compareDocumentPosition(help) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('a quien acaba de cambiar su contraseña con el código le avisa que se actualizó', () => {
    // Arrange
    const router = createMemoryRouter([{ path: '/', element: <HomePage /> }], {
      initialEntries: [{ pathname: '/', state: PASSWORD_UPDATED_NOTICE }],
    })

    // Act
    render(<RouterProvider router={router} />)

    // Assert
    expect(screen.getByText('Tu contraseña se actualizó').closest('[role="status"]')).toBeInTheDocument()
  })

  it('sin ese aviso no muestra nada sobre la contraseña', () => {
    // Arrange: visita normal

    // Act
    renderWithRouter(<HomePage />)

    // Assert
    expect(screen.queryByText('Tu contraseña se actualizó')).not.toBeInTheDocument()
  })
})
