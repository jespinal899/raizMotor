interface PropertyListSkeletonProps {
  count?: number
}

const PropertyListSkeleton = ({ count = 3 }: PropertyListSkeletonProps) => {
  return (
    <ul aria-busy="true" aria-label="Cargando propiedades" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, position) => (
        <li key={position} className="animate-pulse overflow-hidden rounded-xl ring-1 ring-foreground/10">
          <div className="aspect-4/3 bg-muted" />
          <div className="grid gap-3 p-4">
            <div className="h-6 w-1/3 rounded bg-muted" />
            <div className="h-4 w-4/5 rounded bg-muted" />
            <div className="h-4 w-1/2 rounded bg-muted" />
          </div>
        </li>
      ))}
    </ul>
  )
}

export default PropertyListSkeleton
