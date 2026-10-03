import { Skeleton } from '@/components/ui/skeleton'

interface PropertyListSkeletonProps {
  count?: number
}

// Las alturas reproducen las de PropertyCard para que la página no salte cuando llegan los datos.
const PropertyListSkeleton = ({ count = 3 }: PropertyListSkeletonProps) => {
  return (
    <ul aria-busy="true" aria-label="Cargando propiedades" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, position) => (
        <li key={position} className="overflow-hidden rounded-xl ring-1 ring-foreground/10">
          <Skeleton className="aspect-4/3 rounded-none" />
          <div className="flex flex-col gap-2 p-4">
            <Skeleton className="h-7 w-1/3" />
            <Skeleton className="h-5.5 w-4/5" />
            <Skeleton className="h-5 w-1/2" />
            <div className="border-t pt-3">
              <Skeleton className="h-5 w-2/3" />
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}

export default PropertyListSkeleton
