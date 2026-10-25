import { render, screen } from '@testing-library/react'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import RouteErrorPage from '@/pages/RouteErrorPage'
import { BRAND } from '@/shared/constants/brand'
import * as outdatedVersion from '@/router/outdatedVersion'

/** Abre una página cuyo código falla al llegar, con la página de error del sitio. */
const openFailingPage = (error: Error) => {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        errorElement: <RouteErrorPage />,
        lazy: async () => {
          throw error
        },
      },
    ],
    { initialEntries: ['/'] },
  )
  render(<RouterProvider router={router} />)
}

describe('RouteErrorPage', () => {
  beforeEach(() => {
    // El fallo se anota en la consola para quien lo investigue; aquí no hace falta verlo.
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('explica el fallo en español y ofrece intentarlo de nuevo o volver al inicio', async () => {
    // Arrange
    const error = new Error('No se pudo leer el anuncio')

    // Act
    openFailingPage(error)

    // Assert
    expect(await screen.findByRole('heading', { level: 1, name: 'Algo salió mal' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Volver a intentar' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Volver al inicio' })).toHaveAttribute('href', '/')
    expect(document.title).toBe(`Algo salió mal | ${BRAND.name}`)
  })

  it('si el sitio se actualizó mientras estaba abierto, recarga la página en lugar de mostrar el fallo', async () => {
    // Arrange
    const reloadOnce = vi.spyOn(outdatedVersion, 'reloadOnce').mockReturnValue(true)
    const error = new TypeError('Failed to fetch dynamically imported module: /assets/SearchPage-abc.js')

    // Act
    openFailingPage(error)

    // Assert
    expect(await screen.findByLabelText('Cargando página')).toBeInTheDocument()
    expect(reloadOnce).toHaveBeenCalledOnce()
    expect(screen.queryByRole('heading', { name: 'Algo salió mal' })).not.toBeInTheDocument()
  })

  it('si ya recargó y sigue fallando, muestra el fallo', async () => {
    // Arrange
    vi.spyOn(outdatedVersion, 'reloadOnce').mockReturnValue(false)
    const error = new TypeError('Failed to fetch dynamically imported module: /assets/SearchPage-abc.js')

    // Act
    openFailingPage(error)

    // Assert
    expect(await screen.findByRole('heading', { level: 1, name: 'Algo salió mal' })).toBeInTheDocument()
  })
})
