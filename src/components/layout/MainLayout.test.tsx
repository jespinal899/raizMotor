import { render, screen } from '@testing-library/react'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import MainLayout from '@/components/layout/MainLayout'

/** Una aplicación con dos páginas: la segunda tarda en llegar hasta que la prueba la entrega. */
const setup = () => {
  let deliver = () => {}
  const arrived = new Promise<void>((resolve) => {
    deliver = resolve
  })
  const router = createMemoryRouter(
    [
      {
        element: <MainLayout />,
        children: [
          { path: '/', element: <h1>Portada</h1> },
          {
            path: '/lenta',
            lazy: async () => {
              await arrived

              return { element: <h1>Página lenta</h1> }
            },
          },
        ],
      },
    ],
    { initialEntries: ['/'] },
  )
  render(<RouterProvider router={router} />)

  return { router, deliver }
}

describe('MainLayout', () => {
  // jsdom no implementa el desplazamiento de la ventana, que la aplicación ajusta al cambiar de página.
  beforeEach(() => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  })

  it('mientras llega el código de la página siguiente avisa con una barra arriba', async () => {
    // Arrange
    const { router, deliver } = setup()

    // Act
    void router.navigate('/lenta')

    // Assert
    expect(await screen.findByRole('progressbar', { name: 'Abriendo la página' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Portada' })).toBeInTheDocument()
    deliver()
    expect(await screen.findByRole('heading', { name: 'Página lenta' })).toBeInTheDocument()
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })

  it('sin una página por llegar no muestra la barra', () => {
    // Arrange: aplicación recién abierta

    // Act
    setup()

    // Assert
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })
})
