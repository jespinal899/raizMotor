import type { ReactNode } from 'react'
import Container from '@/components/layout/Container'

interface PropertyDetailLayoutProps {
  breadcrumb: ReactNode
  /** Lo que se puede hacer con la ficha (compartir, reportar…). Va en la fila de la ruta, a la derecha. */
  actions?: ReactNode
  header: ReactNode
  /** En escritorio debe adaptarse al alto que se le dé: es lo que hace caber la primera pantalla. */
  gallery: ReactNode
  sidebar: ReactNode
  /** Contenido bajo la galería: descripción, características… */
  children?: ReactNode
  /** Lo que va al final y ocupa el ancho de las dos columnas, de un margen de la página al otro: la ubicación. */
  wide?: ReactNode
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
  wide,
  ...accessibility
}: PropertyDetailLayoutProps) => {
  return (
    <Container as="article" className="grid gap-6 py-8 lg:gap-4 lg:pt-4" {...accessibility}>
      {/*
        La ruta a la izquierda y las acciones a la derecha. En móvil, si no caben, una debajo de la otra;
        en escritorio comparten siempre la fila, y es la ruta la que se parte si el título es largo: una
        fila de más empujaría las fotos fuera de la primera pantalla.
      */}
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 lg:flex-nowrap">
        {breadcrumb}
        {actions}
      </div>

      <div className="grid gap-8">
        {/*
          En móvil todo se apila: título, fotos, cotización y el resto. En escritorio el título va en la
          columna de las fotos, y por eso la barra lateral empieza a su altura. Esa barra solo se queda fija
          al desplazarse si la ventana es alta (`tall`): en una baja no cabe entera y su parte de abajo
          quedaría fuera de la vista.
        */}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          {/*
            Primera pantalla: en escritorio el título y las fotos ocupan lo que queda de ventana bajo la
            barra de navegación y la ruta (10.5rem), de modo que las fotos se ven enteras sin desplazarse;
            el resto empieza justo debajo. La galería se queda con el alto que deja el título, con un
            mínimo para que no se aplaste y un tope (35rem) para que en ventanas altas la foto no crezca
            más de la cuenta.
          */}
          <div className="grid gap-6 lg:col-start-1 lg:min-h-[min(100dvh-10.5rem,35rem)] lg:grid-rows-[auto_minmax(16rem,1fr)] lg:gap-4">
            {header}
            {gallery}
          </div>
          <aside className="lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start lg:tall:sticky lg:tall:top-24">
            {sidebar}
          </aside>
          <div className="grid gap-8 lg:col-start-1">{children}</div>
        </div>

        {/* Bajo las dos columnas y con el ancho de ambas: alineado con los detalles a un lado y el formulario al otro. */}
        {wide}
      </div>
    </Container>
  )
}

export default PropertyDetailLayout
