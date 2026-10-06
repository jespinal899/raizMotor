import { Separator } from '@/components/ui/separator'
import PropertyViews from '@/features/properties/components/PropertyViews'
import ReportPropertyDialog from '@/features/properties/components/ReportPropertyDialog'
import SharePropertyDialog from '@/features/properties/components/SharePropertyDialog'
import type { Property } from '@/features/properties/types/property.types'

interface PropertyToolbarProps {
  property: Property
}

/** Acciones de la ficha, junto a la ruta de navegación: compartir, reportar y cuántas vistas lleva. */
const PropertyToolbar = ({ property }: PropertyToolbarProps) => {
  const { id, localOnly } = property

  return (
    <div role="group" aria-label="Acciones de la ficha" className="flex flex-wrap items-center gap-x-4 gap-y-1">
      <div className="flex items-center gap-1">
        <SharePropertyDialog property={property} />
        {/* Un anuncio guardado solo en este navegador es de quien lo está viendo: no tiene a quién reportarlo. */}
        {!localOnly && (
          <>
            <Separator orientation="vertical" className="h-5 data-vertical:self-center" />
            <ReportPropertyDialog propertyId={id} />
          </>
        )}
      </div>
      <PropertyViews propertyId={id} />
    </div>
  )
}

export default PropertyToolbar
