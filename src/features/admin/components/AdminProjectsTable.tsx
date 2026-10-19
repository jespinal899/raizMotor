import { useState } from 'react'
import { Eye, EyeOff, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import TextField from '@/components/TextField'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import AdminListState from '@/features/admin/components/AdminListState'
import AdminPager from '@/features/admin/components/AdminPager'
import ModerationActionButton from '@/features/admin/components/ModerationActionButton'
import { PROJECT_STATUS_LABELS } from '@/features/admin/data/adminLabels.data'
import { useAdminList } from '@/features/admin/hooks/useAdminList'
import type { AdminProject, AdminProjectStatus, AdminService } from '@/features/admin/types/admin.types'
import { projectDetailPath } from '@/shared/constants/routes'
import { formatLongDate, formatPrice } from '@/shared/utils/format'
import { formatInternationalPhone } from '@/shared/utils/honduranPhone'

const FILTERS: { label: string; status?: AdminProjectStatus }[] = [
  { label: 'Todos' },
  { label: 'Publicados', status: 'published' },
  { label: 'En borrador', status: 'draft' },
  { label: 'Ocultos', status: 'hidden' },
]

interface AdminProjectsTableProps {
  service: AdminService
}

/**
 * Todos los proyectos, también los borradores, con la opción de ocultarlos o devolverlos al catálogo. Un
 * borrador lo publica su inmobiliaria, no el equipo.
 */
const AdminProjectsTable = ({ service }: AdminProjectsTableProps) => {
  const [status, setStatus] = useState<AdminProjectStatus>()
  const [typed, setTyped] = useState('')
  const [search, setSearch] = useState('')
  const list = useAdminList(
    (page) => service.listProjects({ status, search }, page),
    `projects:${status ?? 'all'}:${search}`,
  )

  const renderAction = ({ id, name, status: current }: AdminProject) => {
    if (current === 'hidden') {
      return (
        <ModerationActionButton
          label="Devolver al catálogo"
          icon={Eye}
          title="¿Devolver este proyecto al catálogo?"
          description={`«${name}» vuelve a verse en Proyectos, aunque su inmobiliaria ya no tenga lugar en su plan.`}
          busyLabel="Devolviendo…"
          onConfirm={(note) => service.setProjectStatus(id, 'published', note)}
          onDone={list.reload}
        />
      )
    }

    return (
      <ModerationActionButton
        label="Ocultar"
        icon={EyeOff}
        variant="destructive"
        title="¿Ocultar este proyecto?"
        description={`«${name}» sale del catálogo de proyectos y su inmobiliaria no podrá volver a publicarlo hasta que el equipo lo devuelva.`}
        busyLabel="Ocultando…"
        onConfirm={(note) => service.setProjectStatus(id, 'hidden', note)}
        onDone={list.reload}
      />
    )
  }

  return (
    <div className="grid gap-5">
      <form
        role="search"
        className="flex flex-wrap items-end gap-3"
        onSubmit={(event) => {
          event.preventDefault()
          setSearch(typed.trim())
        }}
      >
        <TextField label="Buscar por nombre" type="search" value={typed} onChange={setTyped} className="w-72 max-w-full" />
        <Button type="submit" size="lg" className="h-11">
          <Search />
          Buscar
        </Button>
      </form>

      <div role="group" aria-label="Estado de los proyectos" className="flex flex-wrap gap-2">
        {FILTERS.map((filter) => (
          <Button
            key={filter.label}
            type="button"
            variant={filter.status === status ? 'default' : 'outline'}
            aria-pressed={filter.status === status}
            onClick={() => setStatus(filter.status)}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      <AdminListState
        isLoading={list.isLoading}
        error={list.error}
        isEmpty={list.items.length === 0}
        empty="No hay proyectos que cumplan la búsqueda."
      >
        <ul className="grid gap-4">
          {list.items.map((project) => (
            <li key={project.id} className="grid gap-2 rounded-2xl border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                {project.status === 'published' ? (
                  <Link to={projectDetailPath(project.id)} className="font-medium text-primary underline-offset-4 hover:underline">
                    {project.name}
                  </Link>
                ) : (
                  <p className="font-medium">{project.name}</p>
                )}
                <Badge variant={project.status === 'hidden' ? 'destructive' : 'outline'}>
                  {PROJECT_STATUS_LABELS[project.status]}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Desde {formatPrice(project.priceFrom)} · {project.city} · publicado el{' '}
                {formatLongDate(project.createdAt.slice(0, 10))}
              </p>
              <p className="text-sm">
                {project.developerName}
                {project.developerPhone && ` · ${formatInternationalPhone(project.developerPhone)}`}
              </p>
              {project.status !== 'draft' && <div>{renderAction(project)}</div>}
            </li>
          ))}
        </ul>
      </AdminListState>

      <AdminPager page={list.page} totalPages={list.totalPages} total={list.total} noun="proyectos" onChange={list.goTo} />
    </div>
  )
}

export default AdminProjectsTable
