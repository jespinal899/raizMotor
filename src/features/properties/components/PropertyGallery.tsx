import { useState } from 'react'
import PropertyPhoto from '@/features/properties/components/PropertyPhoto'
import type { PhotoSource } from '@/features/properties/types/property.types'
import { cn } from '@/lib/utils'

interface PropertyGalleryProps {
  images: PhotoSource[]
  title: string
}

/**
 * Fotos de la propiedad. En móvil, la foto grande con sus miniaturas debajo. En escritorio las miniaturas
 * pasan a una tira a la izquierda y la foto ocupa todo el alto que le dé quien la coloca: así cabe en la
 * primera pantalla sin gastar alto en las miniaturas.
 *
 * En escritorio la foto y la tira van superpuestas a su hueco (`absolute`) para no imponerle su propio
 * alto: es el hueco el que manda.
 */
const PropertyGallery = ({ images, title }: PropertyGalleryProps) => {
  const [selected, setSelected] = useState(0)
  const total = images.length
  const hasSeveral = total > 1

  return (
    <div className={cn('grid gap-3', hasSeveral && 'lg:grid-cols-[5.5rem_minmax(0,1fr)]')}>
      {/* Va primero en el documento, para que en móvil quede arriba; en escritorio, a la derecha de la tira. */}
      <div className={cn('relative overflow-hidden rounded-2xl bg-muted', hasSeveral && 'lg:col-start-2 lg:row-start-1')}>
        <PropertyPhoto
          source={images[selected]}
          alt={`${title}, foto ${selected + 1} de ${total}`}
          className="aspect-3/2 w-full object-cover lg:absolute lg:inset-0 lg:aspect-auto lg:h-full"
        />
        {hasSeveral && (
          <span className="absolute right-3 bottom-3 rounded-full bg-slate-950/70 px-2.5 py-1 text-xs font-medium text-white">
            {selected + 1} / {total}
          </span>
        )}
      </div>

      {hasSeveral && (
        <div className="lg:relative lg:col-start-1 lg:row-start-1">
          {/* El relleno deja sitio al borde de la miniatura elegida, que si no se recortaría al desplazar la tira. */}
          <ul
            aria-label="Fotos de la propiedad"
            className="grid grid-cols-4 gap-2 sm:grid-cols-5 lg:absolute lg:inset-0 lg:flex lg:flex-col lg:overflow-y-auto lg:p-1 lg:scrollbar-thin"
          >
            {images.map((image, position) => {
              const active = position === selected

              return (
                <li key={position} className="lg:shrink-0">
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
        </div>
      )}
    </div>
  )
}

export default PropertyGallery
