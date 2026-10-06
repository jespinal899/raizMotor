import type { ReactNode } from 'react'
import Container from '@/components/layout/Container'

interface PropertyDetailLayoutProps {
  breadcrumb: ReactNode
  /** Lo que se puede hacer con la ficha (compartir, reportar…). Va en la fila de la ruta, a la derecha. */
  actions?: ReactNode
  header: ReactNode
  gallery: ReactNode
  sidebar: ReactNode
  /** Contenido bajo la galería: descripción, características… */
  children?: ReactNode
  'aria-busy'?: boolean
  'aria-label'?: string
}

/**
 * Estructura de la página de detalle, compartida por el contenido real y su esqueleto de carga
 * para que ambos ocupen exactamente lo mismo.
 */
const PropertyDetailLayout = ({
  breadcrumb,
  actions,
  header,
  gallery,
  sidebar,
  children,
  ...accessibility
}: PropertyDetailLayoutProps) => {
  return (
    <Container as="article" className="grid gap-6 py-8" {...accessibility}>
      {/* La ruta a la izquierda y las acciones a la derecha; si no caben en una fila, una debajo de la otra. */}
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
        {breadcrumb}
        {actions}
      </div>

      {/*
        En móvil todo se apila: título, fotos, cotización y el resto. En escritorio el título va en la
        columna de las fotos, y por eso la barra lateral empieza a su altura. Esa barra solo se queda fija
        al desplazarse si la ventana es alta (`tall`): en una baja no cabe entera y su parte de abajo
        quedaría fuera de la vista.
      */}
      <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="grid gap-6 lg:col-start-1">
          {header}
          {gallery}
        </div>
        <aside className="lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start lg:tall:sticky lg:tall:top-24">
          {sidebar}
        </aside>
        <div className="grid gap-8 lg:col-start-1">{children}</div>
      </div>
    </Container>
  )
}

export default PropertyDetailLayout
