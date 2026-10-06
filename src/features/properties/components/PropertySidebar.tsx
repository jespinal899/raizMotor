import PropertyContactCard from '@/features/properties/components/PropertyContactCard'
import PropertyViews from '@/features/properties/components/PropertyViews'
import SharePropertyDialog from '@/features/properties/components/SharePropertyDialog'
import type { Property } from '@/features/properties/types/property.types'

interface PropertySidebarProps {
  property: Property
}

/** Columna de la ficha: arriba, compartir y las vistas; debajo, la tarjeta para cotizar. */
const PropertySidebar = ({ property }: PropertySidebarProps) => {
  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-3">
        <SharePropertyDialog property={property} />
        <PropertyViews propertyId={property.id} />
      </div>

      <PropertyContactCard property={property} />
    </div>
  )
}

export default PropertySidebar
