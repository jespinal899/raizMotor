/** Qué página se pide y de qué tamaño. Las páginas empiezan en 1. */
export interface PageRequest {
  page: number
  pageSize: number
}

/** Una página de resultados junto con los totales necesarios para paginar. */
export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/** Opción de un desplegable o de un grupo de opciones. */
export interface SelectOption {
  value: string
  label: string
}
