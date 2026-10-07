import { createBrowserRouter } from 'react-router-dom'
import type { RouteObject } from 'react-router-dom'
import MainLayout from '@/components/layout/MainLayout'
import ForgotPasswordPage from '@/features/auth/pages/ForgotPasswordPage'
import LoginPage from '@/features/auth/pages/LoginPage'
import RegisterPage from '@/features/auth/pages/RegisterPage'
import ContactPage from '@/features/contact/pages/ContactPage'
import LazyPublishPropertyPage from '@/features/properties/pages/LazyPublishPropertyPage'
import PropertyDetailPage from '@/features/properties/pages/PropertyDetailPage'
import SearchPage from '@/features/search/pages/SearchPage'
import PricingPage from '@/features/shop/pages/PricingPage'
import HomePage from '@/pages/HomePage'
import NotFoundPage from '@/pages/NotFoundPage'
import { toRouterBasename } from '@/router/basename'
import { ROUTES } from '@/shared/constants/routes'

/** Las páginas de la aplicación. Van aparte del enrutador para poder abrirlas también en las pruebas. */
export const routes: RouteObject[] = [
  {
    element: <MainLayout />,
    children: [
      { path: ROUTES.home, element: <HomePage /> },
      { path: ROUTES.properties, element: <SearchPage /> },
      { path: ROUTES.propertiesByType, element: <SearchPage /> },
      { path: ROUTES.propertyDetail, element: <PropertyDetailPage /> },
      { path: ROUTES.contact, element: <ContactPage /> },
      { path: ROUTES.forgotPassword, element: <ForgotPasswordPage /> },
      { path: ROUTES.publish, element: <LazyPublishPropertyPage /> },
      { path: ROUTES.pricing, element: <PricingPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    // Entrar y registrarse son pantallas con una sola tarea: llevan la barra de navegación y, del pie,
    // solo el aviso de derechos.
    element: <MainLayout compactFooter />,
    children: [
      { path: ROUTES.login, element: <LoginPage /> },
      { path: ROUTES.register, element: <RegisterPage /> },
    ],
  },
]

export const router = createBrowserRouter(
  routes,
  // El sitio puede publicarse bajo un prefijo (GitHub Pages lo sirve en /<repositorio>/).
  { basename: toRouterBasename(import.meta.env.BASE_URL) },
)
