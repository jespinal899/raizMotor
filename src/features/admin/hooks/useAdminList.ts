import { useState } from 'react'
import { useAsyncData } from '@/hooks/useAsyncData'
import type { PageRequest, Paginated } from '@/shared/types/common.types'

export const ADMIN_PAGE_SIZE = 20

/**
 * Una lista paginada del panel: la página abierta, cómo cambiarla y cómo volver a leerla después de una
 * decisión. `key` identifica lo que se lista (la pestaña y sus filtros): al cambiar, se vuelve a la primera.
 */
export const useAdminList = <T>(load: (page: PageRequest) => Promise<Paginated<T>>, key: string) => {
  const [page, setPage] = useState({ key, number: 1 })
  const [version, setVersion] = useState(0)
  // Otros filtros empiezan siempre en la primera página.
  const current = page.key === key ? page.number : 1

  const { data, isLoading, error } = useAsyncData(
    () => load({ page: current, pageSize: ADMIN_PAGE_SIZE }),
    `${key}:${current}:${version}`,
  )

  const totalPages = data?.totalPages ?? 1
  // Si tras una decisión la página abierta quedó vacía (se resolvió su último reporte), se pasa a la última.
  if (data && current > totalPages) setPage({ key, number: totalPages })

  return {
    items: data?.items ?? [],
    total: data?.total ?? 0,
    page: current,
    totalPages,
    isLoading,
    error,
    goTo: (number: number) => setPage({ key, number: Math.max(1, Math.min(number, totalPages)) }),
    /** Vuelve a leer la página abierta, después de una decisión que la cambia. */
    reload: () => setVersion((value) => value + 1),
  }
}
