import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AdminPagerProps {
  page: number
  totalPages: number
  total: number
  /** Qué se cuenta, en plural: "reportes", "anuncios"… */
  noun: string
  onChange: (page: number) => void
}

/** Cuántos hay y en qué página se está, con los botones para ir a la anterior y a la siguiente. */
const AdminPager = ({ page, totalPages, total, noun, onChange }: AdminPagerProps) => {
  return (
    <nav aria-label={`Páginas de ${noun}`} className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground">
        {total} {noun} · página {page} de {totalPages}
      </p>
      <div className="flex gap-2">
        <Button type="button" variant="outline" disabled={page <= 1} onClick={() => onChange(page - 1)}>
          <ChevronLeft />
          Anterior
        </Button>
        <Button type="button" variant="outline" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
          Siguiente
          <ChevronRight />
        </Button>
      </div>
    </nav>
  )
}

export default AdminPager
