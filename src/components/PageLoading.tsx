import Container from '@/components/layout/Container'
import { Skeleton } from '@/components/ui/skeleton'

/** Marcador mientras una página aún no puede mostrarse: se descarga su código o se comprueba un dato del que depende. */
const PageLoading = () => {
  return (
    <Container className="py-10">
      <Skeleton aria-busy="true" aria-label="Cargando página" className="h-96 rounded-2xl" />
    </Container>
  )
}

export default PageLoading
