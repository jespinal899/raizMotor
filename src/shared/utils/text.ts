/** Quita tildes, mayúsculas y espacios sobrantes para comparar textos escritos por el usuario. */
export const normalizeText = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
