import Container from '@/components/layout/Container'
import { Skeleton } from '@/components/ui/skeleton'

/** Marcador mientras se descarga el código de una página que no viene en la carga inicial. */
const PageLoading = () => {
  return (
    <Container className="py-10">
      <Skeleton aria-busy="true" aria-label="Cargando página" className="h-96 rounded-2xl" />
    </Container>
  )
}

export default PageLoading
