/** Lado más largo, en píxeles, con que se guarda una foto: suficiente para verla grande sin que pese. */
export const MAX_PHOTO_SIDE = 1600
const QUALITY = 0.82
const RESIZED_TYPE = 'image/webp'

const EXTENSIONS: Record<string, string> = { 'image/webp': 'webp', 'image/jpeg': 'jpg', 'image/png': 'png' }

/** Extensión del archivo con que se guarda una foto de ese tipo. */
export const photoExtension = (type: string) => (Object.hasOwn(EXTENSIONS, type) ? EXTENSIONS[type] : EXTENSIONS['image/jpeg'])

/** Medidas con que una foto cabe en el lado máximo, sin deformarla ni agrandarla. */
export const fitWithin = (width: number, height: number, maxSide = MAX_PHOTO_SIDE) => {
  const scale = Math.min(1, maxSide / Math.max(width, height))

  return { width: Math.round(width * scale), height: Math.round(height * scale) }
}

/**
 * Reduce una foto antes de subirla: las de un teléfono pesan varios megas, y el catálogo las cargaría tal
 * cual. Si el navegador no puede reducirla, o la reducida no pesa menos, se sube la original.
 */
export const resizePhoto = async (photo: File): Promise<Blob> => {
  try {
    const bitmap = await createImageBitmap(photo)
    const canvas = document.createElement('canvas')
    Object.assign(canvas, fitWithin(bitmap.width, bitmap.height))
    canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()

    const resized = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, RESIZED_TYPE, QUALITY))

    return resized && resized.size < photo.size ? resized : photo
  } catch {
    return photo
  }
}
