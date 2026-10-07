import type { Property } from '@/features/properties/types/property.types'
import { cn } from '@/lib/utils'
import { CONVERSION_NOTE } from '@/shared/constants/currency'
import { formatPrice, formatPriceInLempiras } from '@/shared/utils/format'

const detailStyle = 'text-sm font-normal text-muted-foreground'

interface PropertyPriceProps {
  property: Pick<Property, 'price' | 'operation'>
  /** Texto que antecede al importe, p. ej. "Desde". */
  prefix?: string
  /** Para el precio en dólares, que es el que manda: p. ej. su tamaño. */
  className?: string
}

/**
 * El precio de una propiedad en sus dos monedas: en dólares, que es como se publica, y debajo su
 * equivalente aproximado en lempiras.
 */
const PropertyPrice = ({ property: { price, operation }, prefix, className }: PropertyPriceProps) => {
  const isRent = operation === 'alquiler'

  return (
    <div className="grid gap-0.5">
      <p className={cn('font-heading text-xl font-semibold tracking-tight text-primary', className)}>
        {/* Los espacios dentro de cada parte mantienen legible el texto para lectores de pantalla y al copiarlo. */}
        {prefix && <span className={detailStyle}>{prefix} </span>}
        {formatPrice(price)}
        {isRent && <span className={detailStyle}> / mes</span>}
      </p>
      <p title={CONVERSION_NOTE} className={detailStyle}>
        ≈ {formatPriceInLempiras(price)}
        {isRent && ' / mes'}
      </p>
    </div>
  )
}

export default PropertyPrice
