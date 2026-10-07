/** Casillas de la tira de miniaturas. Con más fotos, la última dice cuántas faltan en lugar de mostrar una. */
export const MAX_THUMBNAILS = 4

export interface ThumbnailStrip {
  /** Fotos que tienen su miniatura. */
  shown: number
  /** Fotos que no caben en la tira: las anuncia la casilla "+N". */
  remaining: number
}

export const toThumbnailStrip = (total: number): ThumbnailStrip => {
  if (total <= MAX_THUMBNAILS) return { shown: total, remaining: 0 }

  // La casilla "+N" ocupa un sitio, así que se enseña una miniatura menos.
  const shown = MAX_THUMBNAILS - 1

  return { shown, remaining: total - shown }
}

/** La foto siguiente (`1`) o la anterior (`-1`), dando la vuelta al llegar a un extremo. */
export const stepPhoto = (current: number, step: 1 | -1, total: number): number => (current + step + total) % total
