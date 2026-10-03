const PropertyDetailSkeleton = () => {
  return (
    <div
      aria-busy="true"
      aria-label="Cargando propiedad"
      className="mx-auto grid max-w-7xl animate-pulse gap-6 px-4 py-8 sm:px-6 lg:px-8"
    >
      <div className="h-4 w-64 max-w-full rounded bg-muted" />
      <div className="grid gap-3">
        <div className="h-5 w-32 rounded bg-muted" />
        <div className="h-9 w-2/3 rounded bg-muted" />
        <div className="h-4 w-40 rounded bg-muted" />
      </div>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="aspect-3/2 rounded-2xl bg-muted" />
        <div className="h-64 rounded-xl bg-muted" />
      </div>
    </div>
  )
}

export default PropertyDetailSkeleton
