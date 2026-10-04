import { useId } from 'react'
import type { ReactNode } from 'react'

interface FormSectionProps {
  title: string
  description?: string
  children: ReactNode
}

/** Bloque de un formulario largo: agrupa campos relacionados bajo un encabezado. */
const FormSection = ({ title, description, children }: FormSectionProps) => {
  const titleId = useId()

  return (
    <section aria-labelledby={titleId} className="grid gap-5 rounded-2xl border bg-card p-5 sm:p-6">
      <header className="grid gap-1">
        <h2 id={titleId} className="font-heading text-xl font-semibold">
          {title}
        </h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </header>
      {children}
    </section>
  )
}

export default FormSection
