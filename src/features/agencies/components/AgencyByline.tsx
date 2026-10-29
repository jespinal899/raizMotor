import { Link } from 'react-router-dom'
import AgencyLogo from '@/features/agencies/components/AgencyLogo'
import VerifiedBadge from '@/features/agencies/components/VerifiedBadge'
import type { AgencyBrand } from '@/features/agencies/types/agency.types'
import { ADVERTISER_KINDS } from '@/features/properties/data/propertyOptions.data'
import { agencyPath } from '@/shared/constants/routes'

interface AgencyBylineProps {
  agency: AgencyBrand
  /** Lo que va encima del nombre: «Publicado por», «Lo comercializa»… */
  label?: string
}

/** Quién publica, cuando es una inmobiliaria: su logo, su nombre con enlace a su página y si está verificada. */
const AgencyByline = ({ agency, label = 'Publicado por' }: AgencyBylineProps) => {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <AgencyLogo agency={agency} alt="" className="size-12 text-sm" />
      <div className="grid min-w-0">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
        <Link
          to={agencyPath(agency.slug)}
          className="truncate leading-snug font-medium text-foreground underline-offset-4 hover:text-primary hover:underline"
        >
          {agency.name}
        </Link>
        <p className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
          {ADVERTISER_KINDS[agency.kind]}
          {agency.verified && <VerifiedBadge />}
        </p>
      </div>
    </div>
  )
}

export default AgencyByline
