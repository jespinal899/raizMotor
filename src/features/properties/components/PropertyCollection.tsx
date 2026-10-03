import type { ReactNode } from 'react'
import PropertyList from '@/features/properties/components/PropertyList'
import PropertyListSkeleton from '@/features/properties/components/PropertyListSkeleton'
import type { Property } from '@/features/properties/types/property.types'

interface PropertyCollectionProps {
  properties: Property[]
  isLoading: boolean
  error?: Error
  skeletonCount?: number
  emptyState?: ReactNode
}

const PropertyCollection = ({
  properties,
  isLoading,
  error,
  skeletonCount,
  emptyState = null,
}: PropertyCollectionProps) => {
  if (error) {
    return (
      <p role="alert" className="rounded-2xl border border-dashed px-6 py-12 text-center text-muted-foreground">
        No pudimos cargar las propiedades. Inténtalo de nuevo en unos minutos.
      </p>
    )
  }

  if (isLoading) return <PropertyListSkeleton count={skeletonCount} />
  if (properties.length === 0) return emptyState

  return <PropertyList properties={properties} />
}

export default PropertyCollection
