import { Eye } from 'lucide-react'
import { usePropertyViews } from '@/features/properties/hooks/usePropertyViews'
import type { PropertyViewService } from '@/features/properties/services/propertyViewService'
import { formatNumber } from '@/shared/utils/format'

const toViewCount = (views: number) => `${formatNumber(views)} ${views === 1 ? 'vista' : 'vistas'}`

interface PropertyViewsProps {
  propertyId: string
  service?: PropertyViewService
}

/**
 * Cuántas veces se abrió la ficha. Dice de dónde sale la cifra: hoy solo se cuentan las visitas hechas
 * desde este navegador. Si no se pudo contar, no muestra nada.
 */
const PropertyViews = ({ propertyId, service }: PropertyViewsProps) => {
  const views = usePropertyViews(propertyId, service)
  if (views === undefined) return null

  return (
    <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <Eye className="size-4 shrink-0" aria-hidden="true" />
      <span>
        <span className="font-medium text-foreground">{toViewCount(views)}</span> en este navegador
      </span>
    </p>
  )
}

export default PropertyViews
