import type { PageRequest, Paginated } from '@/shared/types/common.types'

/** Con este número de páginas o menos se muestran todas, sin puntos suspensivos. */
const MAX_PAGES_WITHOUT_ELLIPSIS = 7
const SIBLINGS_AROUND_CURRENT = 1

export type PageRangeItem = number | 'ellipsis-start' | 'ellipsis-end'

/** Un número de página o un tamaño válido: entero y desde 1. Lo que no es un número cuenta como 1. */
export const toPositiveInteger = (value: number) => (Number.isFinite(value) ? Math.max(1, Math.floor(value)) : 1)

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

/** Corta la lista en la página pedida. Una página fuera de rango se ajusta a la más cercana válida. */
export const paginate = <T>(items: readonly T[], request: PageRequest): Paginated<T> => {
  const pageSize = toPositiveInteger(request.pageSize)
  const total = items.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const page = clamp(toPositiveInteger(request.page), 1, totalPages)
  const start = (page - 1) * pageSize

  return { items: items.slice(start, start + pageSize), total, page, pageSize, totalPages }
}

/**
 * Números de página a mostrar: siempre la primera, la última y las vecinas de la actual.
 * Los saltos se marcan con puntos suspensivos, salvo que falte un solo número, que se muestra.
 */
export const buildPageRange = (currentPage: number, totalPages: number): PageRangeItem[] => {
  if (totalPages <= MAX_PAGES_WITHOUT_ELLIPSIS) {
    return Array.from({ length: Math.max(totalPages, 0) }, (_, position) => position + 1)
  }

  const current = clamp(currentPage, 1, totalPages)
  const visible = new Set([1, totalPages])
  for (let page = current - SIBLINGS_AROUND_CURRENT; page <= current + SIBLINGS_AROUND_CURRENT; page++) {
    if (page >= 1 && page <= totalPages) visible.add(page)
  }

  const pages = [...visible].sort((a, b) => a - b)
  const range: PageRangeItem[] = []

  pages.forEach((page, position) => {
    const gap = position === 0 ? 0 : page - pages[position - 1]
    if (gap === 2) range.push(page - 1)
    if (gap > 2) range.push(page < current ? 'ellipsis-start' : 'ellipsis-end')
    range.push(page)
  })

  return range
}
