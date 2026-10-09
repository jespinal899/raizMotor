/** Quita tildes, mayúsculas y espacios sobrantes para comparar textos escritos por el usuario. */
export const normalizeText = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()

/** Lo que separa dos párrafos al escribir: una línea en blanco, o varias seguidas. */
const BLANK_LINES = /\n\s*\n/

/**
 * Los párrafos de un texto escrito a mano, tal como los separó quien lo escribió. Dentro de cada uno se
 * conservan sus saltos de línea: así se escribe una lista, con un elemento por línea.
 */
export const toParagraphs = (text: string): string[] =>
  text
    .replace(/\r\n?/g, '\n')
    .split(BLANK_LINES)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
