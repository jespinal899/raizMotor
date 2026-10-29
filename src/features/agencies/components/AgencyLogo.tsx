import type { AgencyBrand } from '@/features/agencies/types/agency.types'
import { initialsOf } from '@/features/agencies/utils/initials'
import { cn } from '@/lib/utils'

interface AgencyLogoProps {
  agency: Pick<AgencyBrand, 'name' | 'logoUrl'>
  /** El tamaño lo pone quien lo usa (`size-10`, `size-24`…). */
  className?: string
  /** Vacío cuando el nombre ya está escrito al lado. */
  alt?: string
}

/** El logo de una inmobiliaria sobre fondo blanco, para que se vea igual sobre una foto; sin logo, sus iniciales. */
const AgencyLogo = ({ agency, className, alt = agency.name }: AgencyLogoProps) => {
  const frame = cn('shrink-0 overflow-hidden rounded-lg border bg-white', className)

  if (agency.logoUrl) {
    return <img src={agency.logoUrl} alt={alt} loading="lazy" className={cn(frame, 'object-contain p-1')} />
  }

  return (
    <span
      role={alt ? 'img' : undefined}
      aria-label={alt || undefined}
      aria-hidden={alt ? undefined : true}
      className={cn(frame, 'grid place-items-center bg-primary/10 font-heading font-semibold text-primary')}
    >
      {initialsOf(agency.name)}
    </span>
  )
}

export default AgencyLogo
