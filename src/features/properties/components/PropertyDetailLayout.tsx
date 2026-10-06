import type { ReactNode } from 'react'
import Container from '@/components/layout/Container'

interface PropertyDetailLayoutProps {
  breadcrumb: ReactNode
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
  header,
  gallery,
  sidebar,
  children,
  ...accessibility
}: PropertyDetailLayoutProps) => {
  return (
    <Container as="article" className="grid gap-6 py-8" {...accessibility}>
      {breadcrumb}
      {header}

      {/*
        En móvil el precio y la cotización van justo después de las fotos; en escritorio, en una columna.
        Esa columna solo se queda fija al desplazarse si la ventana es alta (`tall`): en una baja no cabe
        entera y su parte de abajo quedaría fuera de la vista.
      */}
      <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        {gallery}
        <aside className="lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start lg:tall:sticky lg:tall:top-24">
          {sidebar}
        </aside>
        <div className="grid gap-8 lg:col-start-1">{children}</div>
      </div>
    </Container>
  )
}

export default PropertyDetailLayout
