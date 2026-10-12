import { SearchX } from 'lucide-react'
import { useLocation, useSearchParams } from 'react-router-dom'
import EmptyState from '@/components/EmptyState'
import Pagination from '@/components/Pagination'
import Container from '@/components/layout/Container'
import ProjectCollection from '@/features/projects/components/ProjectCollection'
import ProjectFilters from '@/features/projects/components/ProjectFilters'
import { useProjects } from '@/features/projects/hooks/useProjects'
import {
  PROJECTS_PER_PAGE,
  buildProjectsPath,
  parseProjectFilters,
  parseProjectPage,
} from '@/features/projects/utils/projectSearch'
import { usePageTitle } from '@/hooks/usePageTitle'

const TITLE = 'Proyectos'

/** El catálogo de proyectos en preventa, en construcción o de entrega inmediata. */
const ProjectsPage = () => {
  const [searchParams] = useSearchParams()
  const { search } = useLocation()
  const filters = parseProjectFilters(searchParams)
  const { projects, total, page, totalPages, isLoading, error } = useProjects(filters, {
    page: parseProjectPage(searchParams),
    pageSize: PROJECTS_PER_PAGE,
  })

  usePageTitle(page > 1 ? `${TITLE}, página ${page}` : TITLE)

  return (
    <Container className="grid gap-8 py-8">
      <header className="grid gap-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">{TITLE}</h1>
        <p className="max-w-2xl text-muted-foreground">
          Residenciales, torres, condominios y lotificaciones que las desarrolladoras venden antes de terminarlos: en
          planos, en construcción o listos para entregar.
        </p>
      </header>
      {/* La clave reinicia la zona escrita cuando la dirección cambia desde fuera (menú, botón atrás). */}
      <ProjectFilters key={search} filters={filters} />
      {!isLoading && !error && (
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {total === 1 ? '1 proyecto' : `${total} proyectos`}
        </p>
      )}
      <ProjectCollection
        projects={projects}
        isLoading={isLoading}
        error={error}
        skeletonCount={PROJECTS_PER_PAGE}
        emptyState={
          <EmptyState
            icon={SearchX}
            title="No hay proyectos con esos filtros"
            description="Prueba con otra zona, otra etapa o sin límite de precio."
          />
        }
      />
      <Pagination currentPage={page} totalPages={totalPages} getPageHref={(target) => buildProjectsPath(filters, target)} />
    </Container>
  )
}

export default ProjectsPage
