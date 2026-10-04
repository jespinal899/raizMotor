interface PageHeaderProps {
  title: string
  description?: string
}

/** Encabezado de una página: su título principal y una frase que la presenta. */
const PageHeader = ({ title, description }: PageHeaderProps) => {
  return (
    <header className="grid max-w-2xl gap-3">
      <h1 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">{title}</h1>
      {description && <p className="text-muted-foreground">{description}</p>}
    </header>
  )
}

export default PageHeader
