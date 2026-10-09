import { createBrowserRouter } from 'react-router-dom'
import type { RouteObject } from 'react-router-dom'
import MainLayout from '@/components/layout/MainLayout'
import ForgotPasswordPage from '@/features/auth/pages/ForgotPasswordPage'
import AccountPage from '@/features/auth/pages/AccountPage'
import LoginPage from '@/features/auth/pages/LoginPage'
import RegisterPage from '@/features/auth/pages/RegisterPage'
import ResetPasswordPage from '@/features/auth/pages/ResetPasswordPage'
import { AUTH_LINK } from '@/features/auth/services/authService'
import ContactPage from '@/features/contact/pages/ContactPage'
import PrivacyPage from '@/features/legal/pages/PrivacyPage'
import TermsPage from '@/features/legal/pages/TermsPage'
import LazyEditPropertyPage from '@/features/properties/pages/LazyEditPropertyPage'
import LazyPublishPropertyPage from '@/features/properties/pages/LazyPublishPropertyPage'
import PropertyDetailPage from '@/features/properties/pages/PropertyDetailPage'
import SearchPage from '@/features/search/pages/SearchPage'
import AgentPlanCheckoutPage from '@/features/shop/pages/AgentPlanCheckoutPage'
import AgentPlansPage from '@/features/shop/pages/AgentPlansPage'
import PricingPage from '@/features/shop/pages/PricingPage'
import HomePage from '@/pages/HomePage'
import MyPropertiesPage from '@/pages/MyPropertiesPage'
import NotFoundPage from '@/pages/NotFoundPage'
import ProtectedRoute from '@/router/ProtectedRoute'
import { landFromAuthLink } from '@/router/authLinkLanding'
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
      { path: ROUTES.resetPassword, element: <ResetPasswordPage /> },
      {
        path: ROUTES.publish,
        element: (
          <ProtectedRoute
            title="Inicia sesión para publicar"
            description="Tu anuncio queda a nombre de tu cuenta, con el teléfono que diste al registrarte para que te escriban."
          >
            <LazyPublishPropertyPage />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.myProperties,
        element: (
          <ProtectedRoute
            title="Inicia sesión para ver tus publicaciones"
            description="Tus publicaciones están guardadas en tu cuenta."
          >
            <MyPropertiesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.editProperty,
        element: (
          <ProtectedRoute
            title="Inicia sesión para editar tu anuncio"
            description="Solo quien publicó un anuncio puede corregirlo."
          >
            <LazyEditPropertyPage />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.account,
        element: (
          <ProtectedRoute
            title="Inicia sesión para ver tu cuenta"
            description="Aquí corriges tu nombre y el teléfono al que te escriben por tus anuncios."
          >
            <AccountPage />
          </ProtectedRoute>
        ),
      },
      { path: ROUTES.pricing, element: <PricingPage /> },
      { path: ROUTES.agentPlans, element: <AgentPlansPage /> },
      { path: ROUTES.agentPlanCheckout, element: <AgentPlanCheckoutPage /> },
      { path: ROUTES.terms, element: <TermsPage /> },
      { path: ROUTES.privacy, element: <PrivacyPage /> },
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
  // Hoy el sitio va en la raíz del dominio, pero puede publicarse bajo un prefijo: la compilación lo indica.
  { basename: toRouterBasename(import.meta.env.BASE_URL) },
)

// Quien vuelve desde un enlace de su correo llega a la portada: aquí se le lleva a la página que lo atiende.
void landFromAuthLink(router, AUTH_LINK, window.location.hash)
