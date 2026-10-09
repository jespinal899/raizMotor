import { X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import PropertyPhoto from '@/features/properties/components/PropertyPhoto'
import type { PublicationPhoto } from '@/features/properties/types/publication.types'

interface ImageThumbnailProps {
  /** El archivo recién elegido, o la dirección de una foto que el anuncio ya tenía. */
  photo: PublicationPhoto
  /** Lugar de la foto en el anuncio, empezando en 1; la primera es la portada. */
  position: number
  onRemove: () => void
}

const COVER_POSITION = 1

/** Un archivo se describe con su nombre, para reconocerlo; una foto ya guardada no tiene uno que decir. */
const describe = (photo: PublicationPhoto, position: number) =>
  typeof photo === 'string' ? `Foto ${position}` : `Foto ${position}: ${photo.name}`

const ImageThumbnail = ({ photo, position, onRemove }: ImageThumbnailProps) => {
  return (
    <figure className="relative aspect-4/3 overflow-hidden rounded-lg border bg-muted">
      <PropertyPhoto source={photo} alt={describe(photo, position)} className="size-full object-cover" />
      {position === COVER_POSITION && <Badge className="absolute top-2 left-2">Portada</Badge>}
      <Button
        type="button"
        variant="secondary"
        size="icon-sm"
        aria-label={`Quitar foto ${position}`}
        onClick={onRemove}
        className="absolute top-1.5 right-1.5 shadow-sm"
      >
        <X />
      </Button>
    </figure>
  )
}

export default ImageThumbnail
