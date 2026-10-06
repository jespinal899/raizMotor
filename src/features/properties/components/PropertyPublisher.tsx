import { Building2, HardHat, User } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { ADVERTISER_KINDS } from '@/features/properties/data/propertyOptions.data'
import type { AdvertiserKind, Property } from '@/features/properties/types/property.types'

const KIND_ICONS: Record<AdvertiserKind, LucideIcon> = {
  particular: User,
  inmobiliaria: Building2,
  constructora: HardHat,
}

interface Publisher {
  icon: LucideIcon
  name: string
  detail: string
}

type PublisherSource = Pick<Property, 'advertiser' | 'localOnly'>

const toPublisher = ({ advertiser, localOnly }: PublisherSource): Publisher | undefined => {
  if (advertiser) {
    return { icon: KIND_ICONS[advertiser.kind], name: advertiser.name, detail: ADVERTISER_KINDS[advertiser.kind] }
  }
  // Todavía no hay cuentas que digan un nombre: un anuncio guardado aquí lo publicó quien lo está viendo.
  if (localOnly) return { icon: User, name: 'Tú', detail: 'Desde este navegador' }

  return undefined
}

interface PropertyPublisherProps {
  property: PublisherSource
}

/** Quién publica la propiedad. No aparece si no se sabe. */
const PropertyPublisher = ({ property }: PropertyPublisherProps) => {
  const publisher = toPublisher(property)
  if (!publisher) return null

  const { icon: Icon, name, detail } = publisher

  return (
    <div className="grid gap-3 border-t pt-5">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Publicado por</p>
      <div className="flex items-center gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div className="grid gap-0.5">
          <p className="font-medium">{name}</p>
          <p className="text-sm text-muted-foreground">{detail}</p>
        </div>
      </div>
    </div>
  )
}

export default PropertyPublisher
