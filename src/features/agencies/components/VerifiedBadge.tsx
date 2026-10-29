import { BadgeCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

/** La marca de una inmobiliaria cuyos datos revisó el equipo del sitio. */
const VerifiedBadge = ({ className }: { className?: string }) => (
  <span
    title="El equipo de DomusRaíz revisó los datos de esta inmobiliaria"
    className={cn('inline-flex items-center gap-1 text-xs font-medium text-primary', className)}
  >
    <BadgeCheck className="size-4" aria-hidden="true" />
    Verificada
  </span>
)

export default VerifiedBadge
