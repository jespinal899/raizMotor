import { render, screen, within } from '@testing-library/react'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { routes } from '@/router'
import { BRAND } from '@/shared/constants/brand'
import { ROUTES, agentPlanCheckoutPath } from '@/shared/constants/routes'

/** Abre la aplicación, con sus rutas de verdad, en la dirección indicada, y espera a que pinte el pie. */
const openAt = async (route: string) => {
  render(<RouterProvider router={createMemoryRouter(routes, { initialEntries: [route] })} />)

  return { footer: await screen.findByRole('contentinfo') }
}

/** La barra de navegación es el primer encabezado del documento; las páginas pueden tener el suyo debajo. */
const navbar = () => screen.getAllByRole('banner')[0]

const ACCESS_SCREENS = [
  ['iniciar sesión', ROUTES.login],
  ['registrarse', ROUTES.register],
]

describe('routes', () => {
  // jsdom no implementa el desplazamiento de la ventana, que la aplicación ajusta al cambiar de página.
  beforeEach(() => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  })

  it.each(ACCESS_SCREENS)('en la pantalla de %s el pie lleva solo el aviso de derechos', async (_screen, route) => {
    // Arrange: aplicación sin abrir

    // Act
    const { footer } = await openAt(route)

    // Assert
    expect(within(footer).getByText(/Todos los derechos reservados\.$/)).toBeInTheDocument()
    expect(within(footer).queryByRole('navigation')).not.toBeInTheDocument()
    expect(within(footer).queryByRole('link')).not.toBeInTheDocument()
    expect(within(footer).queryByText(BRAND.tagline)).not.toBeInTheDocument()
  })

  it.each(ACCESS_SCREENS)('la pantalla de %s conserva la barra de navegación', async (_screen, route) => {
    // Arrange: aplicación sin abrir

    // Act
    await openAt(route)

    // Assert
    expect(within(navbar()).getByRole('link', { name: `${BRAND.name}, ir al inicio` })).toHaveAttribute('href', '/')
  })

  it.each([
    ['Términos y condiciones', ROUTES.terms],
    ['Política de privacidad', ROUTES.privacy],
    ['Publica tu propiedad en simples pasos', ROUTES.pricing],
    [`Potencia tu carrera con ${BRAND.name}`, ROUTES.agentPlans],
    ['Contratar Agente Pro', agentPlanCheckoutPath('agente-plan-1')],
  ])('abre la página "%s" en su dirección', async (title, route) => {
    // Arrange: aplicación sin abrir

    // Act
    await openAt(route)

    // Assert
    expect(screen.getByRole('heading', { level: 1, name: title })).toBeInTheDocument()
  })

  it.each([
    ['planes', ROUTES.pricing],
    ['contacto', ROUTES.contact],
    ['recuperar la contraseña', ROUTES.forgotPassword],
    ['términos y condiciones', ROUTES.terms],
  ])('en la página de %s el pie sigue completo, con la marca y sus enlaces', async (_page, route) => {
    // Arrange: aplicación sin abrir

    // Act
    const { footer } = await openAt(route)

    // Assert
    expect(within(footer).getByText(BRAND.tagline)).toBeInTheDocument()
    expect(within(footer).getByRole('navigation', { name: 'Propiedades' })).toBeInTheDocument()
    expect(within(footer).getByRole('navigation', { name: 'Ayuda' })).toBeInTheDocument()
  })
})
