/** Las iniciales de las dos primeras palabras: «Casa Norte» → «CN». Ocupan el lugar del logo mientras no hay uno. */
export const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('')
