import type { ComponentProps } from 'react'
import EmptyState from '@/components/EmptyState'
import Container from '@/components/layout/Container'

type PageMessageProps = Omit<ComponentProps<typeof EmptyState>, 'titleAs' | 'className'>

/** Mensaje que ocupa toda la página (no encontrado, error de carga): su título es el encabezado principal. */
const PageMessage = (props: PageMessageProps) => {
  return (
    <Container className="max-w-2xl py-16">
      <EmptyState titleAs="h1" {...props} />
    </Container>
  )
}

export default PageMessage
