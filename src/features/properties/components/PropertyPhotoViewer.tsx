import type { KeyboardEvent } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Dialog, DialogClose, DialogContent, DialogTitle } from '@/components/ui/dialog'
import PropertyPhoto from '@/features/properties/components/PropertyPhoto'
import type { PhotoSource } from '@/features/properties/types/property.types'
import { stepPhoto } from '@/features/properties/utils/gallery'
import { cn } from '@/lib/utils'

/** Sobre el fondo oscuro del visor: redondo, translúcido y con el foco bien visible. */
const controlStyle =
  'absolute grid place-items-center rounded-full bg-white/10 text-white outline-none transition hover:bg-white/25 focus-visible:ring-3 focus-visible:ring-white/70'

/** Hacia dónde lleva cada flecha del teclado. */
const KEY_STEPS: Record<string, 1 | -1> = { ArrowLeft: -1, ArrowRight: 1 }

interface ArrowProps {
  icon: LucideIcon
  label: string
  onClick: () => void
  className: string
}

const Arrow = ({ icon: Icon, label, onClick, className }: ArrowProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(controlStyle, 'top-1/2 size-12 -translate-y-1/2', className)}
    >
      <Icon className="size-6" aria-hidden="true" />
    </button>
  )
}

interface PropertyPhotoViewerProps {
  images: PhotoSource[]
  title: string
  /** La foto que se ve. La decide quien abre el visor, para que al cerrarlo la ficha siga en ella. */
  selected: number
  isOpen: boolean
  onSelect: (position: number) => void
  onClose: () => void
}

/**
 * Visor de fotos a pantalla completa: la foto entera, sin recortar, con flechas para pasar a la anterior
 * o la siguiente (también con las del teclado) y una X para salir. Con una sola foto no hay a dónde
 * pasar, así que solo la amplía.
 */
const PropertyPhotoViewer = ({ images, title, selected, isOpen, onSelect, onClose }: PropertyPhotoViewerProps) => {
  const total = images.length
  const hasSeveral = total > 1
  const step = (direction: 1 | -1) => onSelect(stepPhoto(selected, direction, total))

  const handleKeyDown = (event: KeyboardEvent) => {
    if (hasSeveral && Object.hasOwn(KEY_STEPS, event.key)) step(KEY_STEPS[event.key])
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      {/* Las clases deshacen la ventana centrada de siempre: aquí ocupa la pantalla entera, sobre fondo oscuro. */}
      <DialogContent
        showCloseButton={false}
        onKeyDown={handleKeyDown}
        className="top-0 left-0 flex h-dvh w-screen max-w-none translate-x-0 translate-y-0 items-center justify-center gap-0 rounded-none bg-slate-950 p-4 text-white ring-0 sm:max-w-none sm:p-16"
      >
        <DialogTitle className="sr-only">Fotos de {title}</DialogTitle>

        <PropertyPhoto
          source={images[selected]}
          alt={`${title}, foto ${selected + 1} de ${total}`}
          className="max-h-full max-w-full rounded-lg object-contain"
        />

        <DialogClose
          render={<button type="button" aria-label="Cerrar" className={cn(controlStyle, 'top-4 right-4 size-11')} />}
        >
          <X className="size-6" aria-hidden="true" />
        </DialogClose>

        {hasSeveral && (
          <>
            <Arrow icon={ChevronLeft} label="Foto anterior" onClick={() => step(-1)} className="left-3 sm:left-5" />
            <Arrow icon={ChevronRight} label="Foto siguiente" onClick={() => step(1)} className="right-3 sm:right-5" />
            <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-sm font-medium">
              {selected + 1} / {total}
            </span>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default PropertyPhotoViewer
