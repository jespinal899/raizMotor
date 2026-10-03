import type { Property } from '@/features/properties/types/property.types'
import { cn } from '@/lib/utils'
import { formatPrice } from '@/shared/utils/format'

interface PropertyPriceProps {
  property: Pick<Property, 'price' | 'operation'>
  className?: string
}

const PropertyPrice = ({ property: { price, operation }, className }: PropertyPriceProps) => {
  return (
    <p className={cn('font-heading text-xl font-semibold tracking-tight text-primary', className)}>
      {formatPrice(price)}
      {operation === 'alquiler' && <span className="text-sm font-normal text-muted-foreground"> / mes</span>}
    </p>
  )
}

export default PropertyPrice
