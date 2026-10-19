import type { PublicationPhoto } from '@/features/properties/types/publication.types'

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
  accepted: PublicationPhoto[]
  rejected: RejectedImage[]
}

/**
 * Identifica una foto: la que el anuncio ya tenía, por su dirección; un archivo, por nombre, peso y fecha.
 * Dos archivos con la misma clave son la misma foto.
 */
export const imageKey = (photo: PublicationPhoto): string =>
  typeof photo === 'string' ? photo : `${photo.name}|${photo.size}|${photo.lastModified}`

const findRejection = (file: File, accepted: PublicationPhoto[], max: number): ImageRejectionReason | undefined => {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return 'type'
  if (file.size > MAX_IMAGE_BYTES) return 'size'
  if (accepted.some((other) => imageKey(other) === imageKey(file))) return 'duplicate'
  if (accepted.length >= max) return 'limit'

  return undefined
}

/**
 * Añade las fotos elegidas a las que ya había y aparta las que no cumplen los requisitos. Caben `max`: las de
 * un anuncio, salvo que se diga otra cosa (un proyecto admite más).
 */
export const addImages = (current: PublicationPhoto[], candidates: File[], max = MAX_IMAGES): ImageSelection => {
  const accepted = [...current]
  const rejected: RejectedImage[] = []

  for (const file of candidates) {
    const reason = findRejection(file, accepted, max)

    if (reason) rejected.push({ name: file.name, reason })
    else accepted.push(file)
  }

  return { accepted, rejected }
}

const REJECTION_REASONS: Record<ImageRejectionReason, (max: number) => string> = {
  type: () => 'no es una foto JPG, PNG o WebP',
  size: () => `pesa más de ${MAX_IMAGE_MEGABYTES} MB`,
  duplicate: () => 'ya estaba agregada',
  limit: (max) => `no cabe: el máximo son ${max} fotos`,
}

/** Frase que explica a la persona por qué no se agregó un archivo. */
export const describeRejection = ({ name, reason }: RejectedImage, max = MAX_IMAGES): string =>
  `${name} ${REJECTION_REASONS[reason](max)}.`
