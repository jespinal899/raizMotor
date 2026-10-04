import { Suspense, lazy } from 'react'
import PageLoading from '@/components/PageLoading'

// Incluye la librería del mapa, que pesa: se descarga solo al entrar en la página de publicar.
const PublishPropertyPage = lazy(() => import('@/features/properties/pages/PublishPropertyPage'))

const LazyPublishPropertyPage = () => {
  return (
    <Suspense fallback={<PageLoading />}>
      <PublishPropertyPage />
    </Suspense>
  )
}

export default LazyPublishPropertyPage
