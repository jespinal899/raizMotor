import { useState } from 'react'
import PropertyPhoto from '@/features/properties/components/PropertyPhoto'
import type { PhotoSource } from '@/features/properties/types/property.types'
import { cn } from '@/lib/utils'

interface PropertyGalleryProps {
  images: PhotoSource[]
  title: string
}

const PropertyGallery = ({ images, title }: PropertyGalleryProps) => {
  const [selected, setSelected] = useState(0)
  const total = images.length
  const hasSeveral = total > 1

  return (
    <div className="grid gap-3">
      <div className="relative overflow-hidden rounded-2xl bg-muted">
        <PropertyPhoto
          source={images[selected]}
          alt={`${title}, foto ${selected + 1} de ${total}`}
          className="aspect-3/2 w-full object-cover"
        />
        {hasSeveral && (
          <span className="absolute right-3 bottom-3 rounded-full bg-slate-950/70 px-2.5 py-1 text-xs font-medium text-white">
            {selected + 1} / {total}
          </span>
        )}
      </div>

      {hasSeveral && (
        <ul aria-label="Fotos de la propiedad" className="grid grid-cols-4 gap-2 sm:grid-cols-5">
          {images.map((image, position) => {
            const active = position === selected

            return (
              <li key={position}>
                <button
                  type="button"
                  onClick={() => setSelected(position)}
                  aria-label={`Ver foto ${position + 1}`}
                  aria-current={active ? 'true' : undefined}
                  className={cn(
                    'block w-full overflow-hidden rounded-lg ring-offset-2 ring-offset-background outline-none transition focus-visible:ring-3 focus-visible:ring-ring/50',
                    active ? 'ring-2 ring-primary' : 'opacity-70 hover:opacity-100',
                  )}
                >
                  <PropertyPhoto source={image} alt="" loading="lazy" className="aspect-4/3 w-full object-cover" />
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default PropertyGallery
