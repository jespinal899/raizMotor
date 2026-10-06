import { PROPERTY_FACT_ICONS } from '@/features/properties/data/propertyOptions.data'
import type { Property } from '@/features/properties/types/property.types'
import { getPropertyStats } from '@/features/properties/utils/propertyStats'
import { cn } from '@/lib/utils'

interface PropertyStatsProps {
  property: Pick<Property, 'bedrooms' | 'bathrooms' | 'area'>
  className?: string
}

const PropertyStats = ({ property, className }: PropertyStatsProps) => {
  return (
    <ul className={cn('flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground', className)}>
      {getPropertyStats(property).map(({ key, text }) => {
        const Icon = PROPERTY_FACT_ICONS[key]

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
