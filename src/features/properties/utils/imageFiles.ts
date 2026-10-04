export const MAX_IMAGES = 10
export const MAX_IMAGE_MEGABYTES = 5
export const MAX_IMAGE_BYTES = MAX_IMAGE_MEGABYTES * 1024 * 1024
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export type ImageRejectionReason = 'type' | 'size' | 'duplicate' | 'limit'

export interface RejectedImage {
  name: string
  reason: ImageRejectionReason
}

export interface ImageSelection {
  accepted: File[]
  rejected: RejectedImage[]
}

/** Identifica una foto por nombre, peso y fecha: dos archivos con la misma clave son la misma foto. */
export const imageKey = (file: File): string => `${file.name}|${file.size}|${file.lastModified}`

const findRejection = (file: File, accepted: File[]): ImageRejectionReason | undefined => {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return 'type'
  if (file.size > MAX_IMAGE_BYTES) return 'size'
  if (accepted.some((other) => imageKey(other) === imageKey(file))) return 'duplicate'
  if (accepted.length >= MAX_IMAGES) return 'limit'

  return undefined
}

/** Añade las fotos elegidas a las que ya había y aparta las que no cumplen los requisitos. */
export const addImages = (current: File[], candidates: File[]): ImageSelection => {
  const accepted = [...current]
  const rejected: RejectedImage[] = []

  for (const file of candidates) {
    const reason = findRejection(file, accepted)

    if (reason) rejected.push({ name: file.name, reason })
    else accepted.push(file)
  }

  return { accepted, rejected }
}

const REJECTION_REASONS: Record<ImageRejectionReason, string> = {
  type: 'no es una foto JPG, PNG o WebP',
  size: `pesa más de ${MAX_IMAGE_MEGABYTES} MB`,
  duplicate: 'ya estaba agregada',
  limit: `no cabe: el máximo son ${MAX_IMAGES} fotos`,
}

/** Frase que explica a la persona por qué no se agregó un archivo. */
export const describeRejection = ({ name, reason }: RejectedImage): string => `${name} ${REJECTION_REASONS[reason]}.`
