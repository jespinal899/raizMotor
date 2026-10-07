import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  /** El final del título, que se resalta en el color de la marca. */
  highlight?: string
  description?: string
  /** Centra el encabezado, para las páginas que se abren con una invitación en lugar de un rótulo. */
  centered?: boolean
}

/** Encabezado de una página: su título principal y una frase que la presenta. */
const PageHeader = ({ title, highlight, description, centered = false }: PageHeaderProps) => {
  return (
    <header className={cn('grid max-w-2xl gap-3', centered && 'mx-auto text-center')}>
      <h1 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">
        {title}
        {highlight && (
          <>
            {' '}
            <span className="text-primary">{highlight}</span>
          </>
        )}
      </h1>
      {description && <p className="text-muted-foreground">{description}</p>}
    </header>
  )
}

export default PageHeader
