import { Bath, BedDouble, Car, Scaling } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Property } from '@/features/properties/types/property.types'
import { getPropertyStats } from '@/features/properties/utils/propertyStats'
import type { PropertyStatKey } from '@/features/properties/utils/propertyStats'
import { cn } from '@/lib/utils'

const STAT_ICONS: Record<PropertyStatKey, LucideIcon> = {
  bedrooms: BedDouble,
  bathrooms: Bath,
  parking: Car,
  area: Scaling,
}

interface PropertyStatsProps {
  property: Pick<Property, 'bedrooms' | 'bathrooms' | 'parking' | 'area'>
  withParking?: boolean
  className?: string
}

const PropertyStats = ({ property, withParking, className }: PropertyStatsProps) => {
  return (
    <ul className={cn('flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground', className)}>
      {getPropertyStats(property, { withParking }).map(({ key, text }) => {
        const Icon = STAT_ICONS[key]

        return (
          <li key={key} className="flex items-center gap-1.5">
            <Icon className="size-4" aria-hidden="true" />
            {text}
          </li>
        )
      })}
    </ul>
  )
}

export default PropertyStats
