import PropertyCard from '@/features/properties/components/PropertyCard'
import type { Property } from '@/features/properties/types/property.types'

interface PropertyListProps {
  properties: Property[]
}

const PropertyList = ({ properties }: PropertyListProps) => {
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {properties.map((property) => (
        <li key={property.id}>
          <PropertyCard property={property} />
        </li>
      ))}
    </ul>
  )
}

export default PropertyList
