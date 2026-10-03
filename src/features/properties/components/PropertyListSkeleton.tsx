interface PropertyListSkeletonProps {
  count?: number
}

// Las alturas reproducen las de PropertyCard para que la página no salte cuando llegan los datos.
const PropertyListSkeleton = ({ count = 3 }: PropertyListSkeletonProps) => {
  return (
    <ul aria-busy="true" aria-label="Cargando propiedades" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, position) => (
        <li key={position} className="animate-pulse overflow-hidden rounded-xl ring-1 ring-foreground/10">
          <div className="aspect-4/3 bg-muted" />
          <div className="flex flex-col gap-2 p-4">
            <div className="h-7 w-1/3 rounded bg-muted" />
            <div className="h-5.5 w-4/5 rounded bg-muted" />
            <div className="h-5 w-1/2 rounded bg-muted" />
            <div className="border-t pt-3">
              <div className="h-5 w-2/3 rounded bg-muted" />
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}

export default PropertyListSkeleton
