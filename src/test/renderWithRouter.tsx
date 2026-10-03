import type { ReactElement } from 'react'
import { render } from '@testing-library/react'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'

/** Renderiza dentro de un router en memoria y lo devuelve para comprobar a dónde se navegó. */
export const renderWithRouter = (ui: ReactElement, route = '/') => {
  const router = createMemoryRouter([{ path: '*', element: ui }], { initialEntries: [route] })
  const view = render(<RouterProvider router={router} />)

  const currentPath = () => router.state.location.pathname + decodeURIComponent(router.state.location.search)

  return { ...view, currentPath }
}
