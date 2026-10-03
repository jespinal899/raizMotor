import type { ReactElement } from 'react'
import { render } from '@testing-library/react'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'

interface RouterOptions {
  /** URL en la que arranca la prueba. */
  route?: string
  /** Patrón de ruta del componente, necesario cuando lee parámetros como `:id`. */
  path?: string
}

/** Renderiza dentro de un router en memoria y permite comprobar a dónde se navegó. */
export const renderWithRouter = (ui: ReactElement, { route = '/', path = '*' }: RouterOptions = {}) => {
  const routes = path === '*' ? [{ path, element: ui }] : [{ path, element: ui }, { path: '*', element: null }]
  const router = createMemoryRouter(routes, { initialEntries: [route] })
  const view = render(<RouterProvider router={router} />)

  const currentPath = () => router.state.location.pathname + decodeURIComponent(router.state.location.search)

  return { ...view, currentPath }
}
