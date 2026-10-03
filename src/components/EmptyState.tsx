import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  /** Nivel del encabezado: `h1` cuando el estado vacío es toda la página. */
  titleAs?: 'h1' | 'h2'
  /** Acciones que se ofrecen al usuario, normalmente enlaces. */
  children?: ReactNode
  className?: string
}

const EmptyState = ({ icon: Icon, title, description, titleAs: Title = 'h2', children, className }: EmptyStateProps) => {
  return (
    <div
      className={cn(
        'grid justify-items-center gap-3 rounded-2xl border border-dashed px-6 py-16 text-center',
        className,
      )}
    >
      <Icon className="size-10 text-muted-foreground" aria-hidden="true" />
      <Title className="font-heading text-lg font-medium">{title}</Title>
      {description && <p className="max-w-md text-sm text-muted-foreground">{description}</p>}
      {children && <div className="mt-2 flex flex-wrap justify-center gap-2">{children}</div>}
    </div>
  )
}

export default EmptyState
