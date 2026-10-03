import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export interface BreadcrumbItem {
  label: string
  /** Sin destino, el elemento se trata como la página actual. */
  to?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

const Breadcrumb = ({ items }: BreadcrumbProps) => {
  return (
    <nav aria-label="Ruta de navegación">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        {items.map(({ label, to }, position) => (
          <li key={label} className="flex min-w-0 items-center gap-1.5">
            {position > 0 && <ChevronRight className="size-3.5 shrink-0" aria-hidden="true" />}
            {to ? (
              <Link
                to={to}
                className="rounded outline-none transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {label}
              </Link>
            ) : (
              <span aria-current="page" className="truncate text-foreground">
                {label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export default Breadcrumb
