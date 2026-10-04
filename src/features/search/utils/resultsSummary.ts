interface ResultsPage {
  total: number
  page: number
  pageSize: number
  /** Cuántos resultados hay en la página que se está viendo. */
  count: number
}

/** Texto que resume los resultados: el total, o el tramo visible cuando hay varias páginas. */
export const formatResultsSummary = ({ total, page, pageSize, count }: ResultsPage): string => {
  if (total === 1) return '1 propiedad encontrada'
  if (total <= pageSize) return `${total} propiedades encontradas`

  const first = (page - 1) * pageSize + 1
  const last = first + count - 1

  return `Mostrando ${first}–${last} de ${total} propiedades`
}
