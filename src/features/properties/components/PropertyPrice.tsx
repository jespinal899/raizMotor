import type { Property } from '@/features/properties/types/property.types'
import { cn } from '@/lib/utils'
import { formatPrice } from '@/shared/utils/format'

const detailStyle = 'text-sm font-normal text-muted-foreground'

interface PropertyPriceProps {
  property: Pick<Property, 'price' | 'operation'>
  /** Texto que antecede al importe, p. ej. "Desde". */
  prefix?: string
  className?: string
}

const PropertyPrice = ({ property: { price, operation }, prefix, className }: PropertyPriceProps) => {
  return (
    <p className={cn('font-heading text-xl font-semibold tracking-tight text-primary', className)}>
      {/* Los espacios dentro de cada parte mantienen legible el texto para lectores de pantalla y al copiarlo. */}
      {prefix && <span className={detailStyle}>{prefix} </span>}
      {formatPrice(price)}
      {operation === 'alquiler' && <span className={detailStyle}> / mes</span>}
    </p>
  )
}

export default PropertyPrice
