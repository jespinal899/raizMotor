import { createBrowserRouter } from 'react-router-dom'
import MainLayout from '@/components/layout/MainLayout'
import LoginPage from '@/features/auth/pages/LoginPage'
import ContactPage from '@/features/contact/pages/ContactPage'
import LazyPublishPropertyPage from '@/features/properties/pages/LazyPublishPropertyPage'
import PropertyDetailPage from '@/features/properties/pages/PropertyDetailPage'
import SearchPage from '@/features/search/pages/SearchPage'
import PricingPage from '@/features/shop/pages/PricingPage'
import HomePage from '@/pages/HomePage'
import NotFoundPage from '@/pages/NotFoundPage'
import { toRouterBasename } from '@/router/basename'
import { ROUTES } from '@/shared/constants/routes'

export const router = createBrowserRouter(
  [
    {
      element: <MainLayout />,
      children: [
        { path: ROUTES.home, element: <HomePage /> },
        { path: ROUTES.properties, element: <SearchPage /> },
        { path: ROUTES.propertiesByType, element: <SearchPage /> },
        { path: ROUTES.propertyDetail, element: <PropertyDetailPage /> },
        { path: ROUTES.contact, element: <ContactPage /> },
        { path: ROUTES.login, element: <LoginPage /> },
        { path: ROUTES.publish, element: <LazyPublishPropertyPage /> },
        { path: ROUTES.pricing, element: <PricingPage /> },
        { path: '*', element: <NotFoundPage /> },
      ],
    },
  ],
  // El sitio puede publicarse bajo un prefijo (GitHub Pages lo sirve en /<repositorio>/).
  { basename: toRouterBasename(import.meta.env.BASE_URL) },
)
