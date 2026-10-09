import { Suspense, lazy } from 'react'
import PageLoading from '@/components/PageLoading'

// Lleva el mismo formulario que publicar, con la librería del mapa: se descarga solo al entrar a editar.
const EditPropertyPage = lazy(() => import('@/features/properties/pages/EditPropertyPage'))

const LazyEditPropertyPage = () => {
  return (
    <Suspense fallback={<PageLoading />}>
      <EditPropertyPage />
    </Suspense>
  )
}

export default LazyEditPropertyPage
