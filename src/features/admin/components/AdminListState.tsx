import type { ReactNode } from 'react'
import { LoaderCircle } from 'lucide-react'

interface AdminListStateProps {
  isLoading: boolean
  error?: Error
  isEmpty: boolean
  /** Lo que se dice cuando no hay nada que mostrar. */
  empty: string
  children: ReactNode
}

/** La lista de una pestaña del panel, o lo que la sustituye mientras carga, si falló o si está vacía. */
const AdminListState = ({ isLoading, error, isEmpty, empty, children }: AdminListStateProps) => {
  if (error) {
    return (
      <p role="alert" className="rounded-2xl border border-dashed px-6 py-8 text-center text-sm text-muted-foreground">
        No pudimos cargar la lista. Inténtalo de nuevo en unos minutos.
      </p>
    )
  }

  if (isLoading) {
    return (
      <p role="status" className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
        <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
        Cargando…
      </p>
    )
  }

  if (isEmpty) {
    return <p className="rounded-2xl border border-dashed px-6 py-8 text-center text-sm text-muted-foreground">{empty}</p>
  }

  return children
}

export default AdminListState
