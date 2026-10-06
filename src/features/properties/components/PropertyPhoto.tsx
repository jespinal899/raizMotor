import type { ComponentProps } from 'react'
import type { PhotoSource } from '@/features/properties/types/property.types'
import { useObjectUrlRef } from '@/hooks/useObjectUrlRef'

type ImageProps = Omit<ComponentProps<'img'>, 'src' | 'alt'> & {
  /** Vacío cuando la foto es un adorno: el título de la propiedad ya la describe. */
  alt: string
}

interface LocalPhotoProps extends ImageProps {
  file: Blob
}

/** La dirección temporal dura lo que la imagen en pantalla: se crea al mostrarla y se libera al retirarla. */
const LocalPhoto = ({ file, alt, ...imageProps }: LocalPhotoProps) => {
  const photoRef = useObjectUrlRef(file)

  return <img ref={photoRef} alt={alt} {...imageProps} />
}

interface PropertyPhotoProps extends ImageProps {
  source: PhotoSource
}

/** Foto de una propiedad, venga de una dirección web o de un archivo guardado en este navegador. */
const PropertyPhoto = ({ source, alt, ...imageProps }: PropertyPhotoProps) => {
  return typeof source === 'string' ? (
    <img src={source} alt={alt} {...imageProps} />
  ) : (
    <LocalPhoto file={source} alt={alt} {...imageProps} />
  )
}

export default PropertyPhoto
