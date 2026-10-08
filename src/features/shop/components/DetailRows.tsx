import type { DetailRow } from '@/features/shop/types/checkout.types'
import { cn } from '@/lib/utils'

interface DetailRowsProps {
  rows: DetailRow[]
  className?: string
}

/** Una lista de datos con su valor, cada uno en su línea: el dato a la izquierda y el valor a la derecha. */
const DetailRows = ({ rows, className }: DetailRowsProps) => {
  return (
    <dl className={cn('grid gap-2 text-sm', className)}>
      {rows.map(({ label, value }) => (
        <div key={label} className="flex justify-between gap-4">
          <dt className="text-muted-foreground">{label}</dt>
          <dd className="text-right">{value}</dd>
        </div>
      ))}
    </dl>
  )
}

export default DetailRows
