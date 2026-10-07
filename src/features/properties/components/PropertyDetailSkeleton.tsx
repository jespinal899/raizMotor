import { Skeleton } from '@/components/ui/skeleton'
import PropertyDetailLayout from '@/features/properties/components/PropertyDetailLayout'

const PropertyDetailSkeleton = () => {
  return (
    <PropertyDetailLayout
      aria-busy
      aria-label="Cargando propiedad"
      breadcrumb={<Skeleton className="h-4 w-64 max-w-full" />}
      header={
        <div className="grid gap-3">
          <Skeleton className="h-9 w-2/3" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-8 w-44" />
        </div>
      }
      gallery={<Skeleton className="aspect-3/2 rounded-2xl lg:aspect-auto" />}
      sidebar={<Skeleton className="h-64 rounded-xl" />}
    />
  )
}

export default PropertyDetailSkeleton
