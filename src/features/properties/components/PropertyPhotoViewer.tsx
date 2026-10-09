import { useState } from 'react'
import type { KeyboardEvent } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Dialog, DialogClose, DialogContent, DialogTitle } from '@/components/ui/dialog'
import PropertyPhoto from '@/features/properties/components/PropertyPhoto'
import type { PhotoSource } from '@/features/properties/types/property.types'
import { adjacentPhotos, stepPhoto } from '@/features/properties/utils/gallery'
import { useIsPageZoomed } from '@/hooks/useIsPageZoomed'
import { useSwipe } from '@/hooks/useSwipe'
import type { SwipeDirection } from '@/hooks/useSwipe'
import { cn } from '@/lib/utils'

/** Sobre el fondo oscuro del visor: redondo, translúcido y con el foco bien visible. */
const controlStyle =
  'absolute grid place-items-center rounded-full bg-white/10 text-white outline-none transition hover:bg-white/25 focus-visible:ring-3 focus-visible:ring-white/70'

type Step = 1 | -1

/** Hacia dónde lleva cada flecha del teclado. */
const KEY_STEPS: Record<string, Step> = { ArrowLeft: -1, ArrowRight: 1 }

/** Deslizar hacia la izquierda trae la foto siguiente, como al pasar una página. */
const SWIPE_STEPS: Record<SwipeDirection, Step> = { left: 1, right: -1 }

/** La foto nueva entra por el lado del que viene: por la derecha la siguiente, por la izquierda la anterior. */
const ENTRANCES: Record<Step, string> = {
  1: 'animate-in fade-in slide-in-from-right-16',
  [-1]: 'animate-in fade-in slide-in-from-left-16',
}

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
 * Visor de fotos a pantalla completa: la foto entera, sin recortar, y una X para salir. Se pasa a la
 * anterior o la siguiente deslizando con el dedo —o arrastrando con el ratón—, con las flechas en pantalla
 * o con las del teclado. Con una sola foto no hay a dónde pasar, así que solo la amplía.
 *
 * La foto se puede ampliar con dos dedos, como cualquier página. Mientras está ampliada no se desliza: el
 * dedo sirve entonces para recorrerla, y pasar a otra sin querer sería perder lo que se estaba mirando.
 */
const PropertyPhotoViewer = ({ images, title, selected, isOpen, onSelect, onClose }: PropertyPhotoViewerProps) => {
  const total = images.length
  const hasSeveral = total > 1
  const isPageZoomed = useIsPageZoomed()
  const canSwipe = hasSeveral && !isPageZoomed
  /** Hacia dónde se pasó por última vez, para saber por qué lado entra la foto. Al abrir, por ninguno. */
  const [lastStep, setLastStep] = useState<Step | null>(null)

  const step = (direction: Step) => {
    setLastStep(direction)
    onSelect(stepPhoto(selected, direction, total))
  }

  const swipe = useSwipe({ onSwipe: (direction) => step(SWIPE_STEPS[direction]), enabled: canSwipe })

  const handleKeyDown = (event: KeyboardEvent) => {
    if (hasSeveral && Object.hasOwn(KEY_STEPS, event.key)) step(KEY_STEPS[event.key])
  }

  const close = () => {
    setLastStep(null)
    onClose()
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) close()
      }}
    >
      {/*
        Las clases deshacen la ventana centrada de siempre: aquí ocupa la pantalla entera, sobre fondo oscuro.
        Se desliza sobre toda ella, no solo sobre la foto, que en un móvil apaisado puede ser una franja.
      */}
      <DialogContent
        showCloseButton={false}
        onKeyDown={handleKeyDown}
        {...swipe.handlers}
        className={cn(
          'top-0 left-0 flex h-dvh w-screen max-w-none translate-x-0 translate-y-0 items-center justify-center gap-0 overflow-hidden rounded-none bg-slate-950 p-4 text-white ring-0 select-none sm:max-w-none sm:p-16',
          // El gesto horizontal es del visor; el vertical y el de ampliar, del navegador. Cuando no se puede
          // deslizar, todos son del navegador: con la foto ampliada es él quien la mueve bajo el dedo.
          canSwipe && 'touch-pan-y touch-pinch-zoom',
          // Con el ratón, el cursor de «agarrar» avisa de que la foto se puede arrastrar.
          canSwipe && (swipe.isDragging ? 'cursor-grabbing' : 'cursor-grab'),
        )}
      >
        <DialogTitle className="sr-only">Fotos de {title}</DialogTitle>

        <PropertyPhoto
          // Otra foto es otra imagen: así entra con su animación, en lugar de cambiar la que había.
          key={selected}
          source={images[selected]}
          alt={`${title}, foto ${selected + 1} de ${total}`}
          // Sin esto el navegador arrastraría la imagen como un archivo, en lugar de dejarla deslizar.
          draggable={false}
          // Acompaña al dedo mientras se arrastra; al soltar sin llegar a deslizar, vuelve a su sitio.
          style={{ transform: `translateX(${swipe.offset}px)` }}
          className={cn(
            'max-h-full max-w-full rounded-lg object-contain duration-200',
            // Sin transición mientras se arrastra: con ella iría siempre por detrás del dedo.
            swipe.isDragging ? 'transition-none' : 'transition-transform',
            lastStep && ENTRANCES[lastStep],
          )}
        />

        {/* Las de al lado se descargan ya, sin verse: así, al deslizar, la que entra no llega en blanco. */}
        {adjacentPhotos(selected, total).map((position) => (
          <PropertyPhoto key={position} source={images[position]} alt="" className="hidden" />
        ))}

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
