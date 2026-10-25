import type { ComponentType } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import type { RouteObject } from 'react-router-dom'
import PageLoading from '@/components/PageLoading'
import MainLayout from '@/components/layout/MainLayout'
import { AUTH_LINK } from '@/features/auth/services/authService'
import LazyEditPropertyPage from '@/features/properties/pages/LazyEditPropertyPage'
import LazyPublishPropertyPage from '@/features/properties/pages/LazyPublishPropertyPage'
import HomePage from '@/pages/HomePage'
import NotFoundPage from '@/pages/NotFoundPage'
import RouteErrorPage from '@/pages/RouteErrorPage'
import ProtectedRoute from '@/router/ProtectedRoute'
import type { ProtectedRouteProps } from '@/router/ProtectedRoute'
import { landFromAuthLink } from '@/router/authLinkLanding'
import { toRouterBasename } from '@/router/basename'
import { ROUTES } from '@/shared/constants/routes'

type Guard = Omit<ProtectedRouteProps, 'children'>

/**
 * Una página que se descarga al entrar en ella, no con el resto del sitio: así la portada abre antes. Al
 * navegar, el enrutador espera su código antes de cambiar de página; si se abre directamente, mientras llega se
 * ve la barra, el pie y un marcador de carga. Con `guard`, solo la ve quien tiene la sesión abierta.
 */
const page = (
  load: () => Promise<{ default: ComponentType }>,
  guard?: Guard,
): Pick<RouteObject, 'lazy' | 'HydrateFallback'> => ({
  HydrateFallback: PageLoading,
  lazy: async () => {
    const { default: Page } = await load()

    return {
      element: guard ? (
        <ProtectedRoute {...guard}>
          <Page />
        </ProtectedRoute>
      ) : (
        <Page />
      ),
    }
  },
})

const searchPage = () => import('@/features/search/pages/SearchPage')

/** Las páginas de la aplicación. Van aparte del enrutador para poder abrirlas también en las pruebas. */
export const routes: RouteObject[] = [
  {
    element: <MainLayout />,
    children: [
      {
        // Un fallo al abrir una página se explica dentro del sitio, con la barra y el pie a la vista.
        errorElement: <RouteErrorPage />,
        children: [
          { path: ROUTES.home, element: <HomePage /> },
          { path: ROUTES.properties, ...page(searchPage) },
          { path: ROUTES.propertiesByType, ...page(searchPage) },
          { path: ROUTES.propertyDetail, ...page(() => import('@/features/properties/pages/PropertyDetailPage')) },
          { path: ROUTES.projects, ...page(() => import('@/features/projects/pages/ProjectsPage')) },
          { path: ROUTES.projectDetail, ...page(() => import('@/features/projects/pages/ProjectDetailPage')) },
          { path: ROUTES.contact, ...page(() => import('@/features/contact/pages/ContactPage')) },
          { path: ROUTES.forgotPassword, ...page(() => import('@/features/auth/pages/ForgotPasswordPage')) },
          { path: ROUTES.resetPassword, ...page(() => import('@/features/auth/pages/ResetPasswordPage')) },
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
            ...page(() => import('@/pages/MyPropertiesPage'), {
              title: 'Inicia sesión para ver tus publicaciones',
              description: 'Tus publicaciones están guardadas en tu cuenta.',
            }),
          },
          {
            path: ROUTES.myProjects,
            ...page(() => import('@/features/projects/pages/MyProjectsPage'), {
              title: 'Inicia sesión para ver tus proyectos',
              description: 'Tus proyectos están guardados en tu cuenta.',
            }),
          },
          {
            path: ROUTES.newProject,
            ...page(() => import('@/features/projects/pages/ProjectEditorPage'), {
              title: 'Inicia sesión para publicar un proyecto',
              description: 'Tu proyecto queda a nombre de tu cuenta de inmobiliaria.',
            }),
          },
          {
            path: ROUTES.editProject,
            ...page(() => import('@/features/projects/pages/ProjectEditorPage'), {
              title: 'Inicia sesión para editar tu proyecto',
              description: 'Solo la inmobiliaria que publicó un proyecto puede corregirlo.',
            }),
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
            ...page(() => import('@/features/auth/pages/AccountPage'), {
              title: 'Inicia sesión para ver tu cuenta',
              description: 'Aquí corriges tu nombre y el teléfono al que te escriben por tus anuncios.',
            }),
          },
          {
            path: ROUTES.admin,
            ...page(() => import('@/features/admin/pages/AdminDashboardPage'), {
              title: 'Inicia sesión para entrar al panel',
              description: 'El panel de administración es solo para las cuentas del equipo del sitio.',
            }),
          },
          { path: ROUTES.pricing, ...page(() => import('@/features/shop/pages/PricingPage')) },
          { path: ROUTES.agentPlans, ...page(() => import('@/features/shop/pages/AgentPlansPage')) },
          { path: ROUTES.agentPlanCheckout, ...page(() => import('@/features/shop/pages/AgentPlanCheckoutPage')) },
          { path: ROUTES.agencyPlans, ...page(() => import('@/features/shop/pages/AgencyPlansPage')) },
          { path: ROUTES.agencyPlanCheckout, ...page(() => import('@/features/shop/pages/AgentPlanCheckoutPage')) },
          { path: ROUTES.terms, ...page(() => import('@/features/legal/pages/TermsPage')) },
          { path: ROUTES.privacy, ...page(() => import('@/features/legal/pages/PrivacyPage')) },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
  {
    // Entrar y registrarse son pantallas con una sola tarea: llevan la barra de navegación y, del pie,
    // solo el aviso de derechos.
    element: <MainLayout compactFooter />,
    children: [
      {
        errorElement: <RouteErrorPage />,
        children: [
          { path: ROUTES.login, ...page(() => import('@/features/auth/pages/LoginPage')) },
          { path: ROUTES.register, ...page(() => import('@/features/auth/pages/RegisterPage')) },
        ],
      },
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
