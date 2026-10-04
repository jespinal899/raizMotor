import { useState } from 'react'
import type { ChangeEvent } from 'react'
import { ImagePlus } from 'lucide-react'
import FormGroup from '@/components/FormGroup'
import ImageThumbnail from '@/features/properties/components/ImageThumbnail'
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_IMAGES,
  MAX_IMAGE_MEGABYTES,
  addImages,
  describeRejection,
  imageKey,
} from '@/features/properties/utils/imageFiles'
import type { RejectedImage } from '@/features/properties/utils/imageFiles'

interface ImagePickerProps {
  /** La primera es la portada del anuncio. */
  files: File[]
  onChange: (files: File[]) => void
  error?: string
}

const ImagePicker = ({ files, onChange, error }: ImagePickerProps) => {
  const [rejected, setRejected] = useState<RejectedImage[]>([])
  const isFull = files.length >= MAX_IMAGES

  const handleSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const selection = addImages(files, Array.from(event.target.files ?? []))
    // Vaciar el campo permite volver a elegir un archivo que se acaba de quitar.
    event.target.value = ''

    setRejected(selection.rejected)
    if (selection.accepted.length > files.length) onChange(selection.accepted)
  }

  const remove = (file: File) => {
    setRejected([])
    onChange(files.filter((other) => other !== file))
  }

  return (
    <FormGroup label="Fotos" hint={`hasta ${MAX_IMAGES}, de ${MAX_IMAGE_MEGABYTES} MB como máximo cada una`} error={error}>
      {(group) => (
        <div role="group" {...group} className="grid gap-3">
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {files.map((file, index) => (
              <li key={imageKey(file)}>
                <ImageThumbnail file={file} position={index + 1} onRemove={() => remove(file)} />
              </li>
            ))}
            {!isFull && (
              <li>
                <label className="grid aspect-4/3 cursor-pointer place-content-center justify-items-center gap-2 rounded-lg border border-dashed text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary has-focus-visible:ring-3 has-focus-visible:ring-ring/50">
                  <ImagePlus className="size-6" aria-hidden="true" />
                  Agregar fotos
                  <input
                    type="file"
                    multiple
                    accept={ACCEPTED_IMAGE_TYPES.join(',')}
                    onChange={handleSelect}
                    className="sr-only"
                  />
                </label>
              </li>
            )}
          </ul>

          {isFull && <p className="text-sm text-muted-foreground">Llegaste al máximo de {MAX_IMAGES} fotos.</p>}

          {rejected.length > 0 && (
            <div role="alert" className="text-sm text-destructive">
              <ul className="grid gap-1">
                {rejected.map((image) => (
                  <li key={`${image.name}-${image.reason}`}>{describeRejection(image)}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </FormGroup>
  )
}

export default ImagePicker
