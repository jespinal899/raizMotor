import { ChevronLeft, ChevronRight, Ellipsis } from 'lucide-react'
import ButtonLink from '@/components/ButtonLink'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { buildPageRange } from '@/shared/utils/pagination'

const STEPS = {
  previous: { label: 'Página anterior', text: 'Anterior' },
  next: { label: 'Página siguiente', text: 'Siguiente' },
} as const

interface PageStepProps {
  direction: keyof typeof STEPS
  /** Sin destino (primera o última página) el paso se muestra deshabilitado. */
  to?: string
}

const PageStep = ({ direction, to }: PageStepProps) => {
  const { label, text } = STEPS[direction]
  const content = (
    <>
      {direction === 'previous' && <ChevronLeft />}
      <span className="hidden sm:inline">{text}</span>
      {direction === 'next' && <ChevronRight />}
    </>
  )

  if (!to) {
    return (
      <span
        role="link"
        aria-disabled="true"
        aria-label={label}
        className={cn(buttonVariants({ variant: 'ghost', size: 'lg' }), 'pointer-events-none opacity-40')}
      >
        {content}
      </span>
    )
  }

  return (
    <ButtonLink to={to} variant="ghost" size="lg" aria-label={label}>
      {content}
    </ButtonLink>
  )
}

interface PaginationProps {
  currentPage: number
  totalPages: number
  /** Dirección de cada página; así el componente no conoce la URL de quien lo usa. */
  getPageHref: (page: number) => string
  className?: string
}

const Pagination = ({ currentPage, totalPages, getPageHref, className }: PaginationProps) => {
  if (totalPages <= 1) return null

  return (
    <nav aria-label="Paginación" className={cn('flex justify-center', className)}>
      <ul className="flex flex-wrap items-center justify-center gap-1">
        <li>
          <PageStep direction="previous" to={currentPage > 1 ? getPageHref(currentPage - 1) : undefined} />
        </li>

        {buildPageRange(currentPage, totalPages).map((item) =>
          typeof item === 'number' ? (
            <li key={item}>
              <ButtonLink
                to={getPageHref(item)}
                variant={item === currentPage ? 'default' : 'ghost'}
                size="icon-lg"
                aria-label={`Página ${item}`}
                aria-current={item === currentPage ? 'page' : undefined}
              >
                {item}
              </ButtonLink>
            </li>
          ) : (
            <li key={item} aria-hidden="true" className="grid size-9 place-items-center text-muted-foreground">
              <Ellipsis className="size-4" />
            </li>
          ),
        )}

        <li>
          <PageStep direction="next" to={currentPage < totalPages ? getPageHref(currentPage + 1) : undefined} />
        </li>
      </ul>
    </nav>
  )
}

export default Pagination
