import type { ReactNode } from 'react'

interface PropertyDetailSectionProps {
  /** Identifica el título: une la sección con su nombre para los lectores de pantalla. */
  id: string
  title: string
  children: ReactNode
}

/** Bloque titulado de la ficha de una propiedad: descripción, características, ubicación… */
const PropertyDetailSection = ({ id, title, children }: PropertyDetailSectionProps) => {
  return (
    <section aria-labelledby={id} className="grid gap-3">
      <h2 id={id} className="font-heading text-xl font-semibold tracking-tight">
        {title}
      </h2>
      {children}
    </section>
  )
}

export default PropertyDetailSection
