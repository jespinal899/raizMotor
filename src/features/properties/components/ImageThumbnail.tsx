import { X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useObjectUrlRef } from '@/hooks/useObjectUrlRef'

interface ImageThumbnailProps {
  file: File
  /** Lugar de la foto en el anuncio, empezando en 1; la primera es la portada. */
  position: number
  onRemove: () => void
}

const COVER_POSITION = 1

const ImageThumbnail = ({ file, position, onRemove }: ImageThumbnailProps) => {
  const previewRef = useObjectUrlRef(file)

  return (
    <figure className="relative aspect-4/3 overflow-hidden rounded-lg border bg-muted">
      <img ref={previewRef} alt={`Foto ${position}: ${file.name}`} className="size-full object-cover" />
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
