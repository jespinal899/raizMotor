import { useState } from 'react'
import type { ReactNode } from 'react'
import { Expand } from 'lucide-react'
import PropertyPhoto from '@/features/properties/components/PropertyPhoto'
import PropertyPhotoViewer from '@/features/properties/components/PropertyPhotoViewer'
import type { PhotoSource } from '@/features/properties/types/property.types'
import { toThumbnailStrip } from '@/features/properties/utils/gallery'
import { cn } from '@/lib/utils'

interface ThumbnailProps {
  image: PhotoSource
  label: string
  isCurrent: boolean
  onSelect: () => void
  /** Lo que se superpone a la foto, p. ej. cuántas faltan. */
  children?: ReactNode
}

/** Casilla de la tira. En escritorio se encoge si la tira no tiene alto para todas a su tamaño. */
const Thumbnail = ({ image, label, isCurrent, onSelect, children }: ThumbnailProps) => {
  return (
    <li className="aspect-4/3 lg:min-h-0">
      <button
        type="button"
        onClick={onSelect}
        aria-label={label}
        aria-current={isCurrent ? 'true' : undefined}
        className={cn(
          'relative block size-full overflow-hidden rounded-lg ring-offset-2 ring-offset-background outline-none transition focus-visible:ring-3 focus-visible:ring-ring/50',
          isCurrent ? 'ring-2 ring-primary' : 'opacity-80 hover:opacity-100',
        )}
      >
        <PropertyPhoto source={image} alt="" loading="lazy" className="size-full object-cover" />
        {children}
      </button>
    </li>
  )
}

interface PropertyGalleryProps {
  images: PhotoSource[]
  title: string
}

/**
 * Fotos de la propiedad: la foto grande y una tira de miniaturas que la cambian ahí mismo. Pulsar la foto
 * grande la abre en el visor a pantalla completa, que es donde se pasa de una a otra deslizando o con flechas. Si hay
 * más fotos de las que caben en la tira, la última casilla dice cuántas faltan y abre el visor en la
 * primera de ellas.
 *
 * En móvil la tira va debajo de la foto. En escritorio va a la izquierda, y la foto ocupa todo el alto
 * que le dé quien la coloca: así cabe en la primera pantalla. Allí la foto y la tira van superpuestas a
 * su hueco (`absolute`) para no imponerle su propio alto: es el hueco el que manda.
 */
const PropertyGallery = ({ images, title }: PropertyGalleryProps) => {
  const [selected, setSelected] = useState(0)
  const [isViewerOpen, setIsViewerOpen] = useState(false)
  const total = images.length
  const hasSeveral = total > 1
  const { shown, remaining } = toThumbnailStrip(total)
  const photoName = `${title}, foto ${selected + 1} de ${total}`

  const openViewerAt = (position: number) => {
    setSelected(position)
    setIsViewerOpen(true)
  }

  return (
    <div className={cn('grid gap-3', hasSeveral && 'lg:grid-cols-[6.5rem_minmax(0,1fr)]')}>
      {/* Va primero en el documento, para que en móvil quede arriba; en escritorio, a la derecha de la tira. */}
      <button
        type="button"
        onClick={() => openViewerAt(selected)}
        aria-label={`Ver a pantalla completa: ${photoName}`}
        className={cn(
          'group relative block cursor-zoom-in overflow-hidden rounded-2xl bg-muted outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
          hasSeveral && 'lg:col-start-2 lg:row-start-1',
        )}
      >
        <PropertyPhoto
          source={images[selected]}
          alt={photoName}
          className="aspect-3/2 w-full object-cover lg:absolute lg:inset-0 lg:aspect-auto lg:h-full"
        />
        {/* Señala que la foto se puede ampliar; se nota más al pasar por encima. */}
        <span className="absolute top-3 right-3 grid size-9 place-items-center rounded-full bg-slate-950/60 text-white transition group-hover:bg-slate-950/85">
          <Expand className="size-4" aria-hidden="true" />
        </span>
        {hasSeveral && (
          <span className="absolute right-3 bottom-3 rounded-full bg-slate-950/70 px-2.5 py-1 text-xs font-medium text-white">
            {selected + 1} / {total}
          </span>
        )}
      </button>

      {hasSeveral && (
        <div className="lg:relative lg:col-start-1 lg:row-start-1">
          <ul
            aria-label="Fotos de la propiedad"
            className="grid grid-cols-4 gap-2 lg:absolute lg:inset-0 lg:flex lg:flex-col"
          >
            {images.slice(0, shown).map((image, position) => (
              <Thumbnail
                key={position}
                image={image}
                label={`Ver foto ${position + 1}`}
                isCurrent={position === selected}
                onSelect={() => setSelected(position)}
              />
            ))}
            {remaining > 0 && (
              // Se marca mientras la foto grande sea una de las que no tienen miniatura.
              <Thumbnail
                image={images[shown]}
                label={`Ver ${remaining} fotos más`}
                isCurrent={selected >= shown}
                onSelect={() => openViewerAt(shown)}
              >
                <span className="absolute inset-0 grid place-items-center bg-slate-950/60 text-lg font-semibold text-white">
                  +{remaining}
                </span>
              </Thumbnail>
            )}
          </ul>
        </div>
      )}

      <PropertyPhotoViewer
        images={images}
        title={title}
        selected={selected}
        isOpen={isViewerOpen}
        onSelect={setSelected}
        onClose={() => setIsViewerOpen(false)}
      />
    </div>
  )
}

export default PropertyGallery
