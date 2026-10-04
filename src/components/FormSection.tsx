import { useId } from 'react'
import type { ReactNode, Ref } from 'react'

interface FormSectionProps {
  title: string
  /** Nivel del encabezado: `h3` cuando la sección va dentro de un paso que ya tiene su título. */
  titleAs?: 'h2' | 'h3'
  description?: string
  children: ReactNode
  ref?: Ref<HTMLElement>
}

/** Bloque de un formulario largo: agrupa campos relacionados bajo un encabezado. */
const FormSection = ({ title, titleAs: Title = 'h2', description, children, ref }: FormSectionProps) => {
  const titleId = useId()

  return (
    <section
      ref={ref}
      aria-labelledby={titleId}
      className="grid scroll-mt-24 gap-5 rounded-2xl border bg-card p-5 sm:p-6"
    >
      <header className="grid gap-1">
        <Title id={titleId} className="font-heading text-xl font-semibold">
          {title}
        </Title>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </header>
      {children}
    </section>
  )
}

export default FormSection
