import { projectService } from '@/features/projects/services/projectService'
import type { ProjectService } from '@/features/projects/services/projectService'
import type { ProjectFilters } from '@/features/projects/types/project.types'
import { useAsyncData } from '@/hooks/useAsyncData'
import type { PageRequest } from '@/shared/types/common.types'

/** Identifica una búsqueda por lo que pide, sin depender del orden de los filtros ni de los vacíos. */
const toSearchKey = (filters: ProjectFilters, { page, pageSize }: PageRequest) => {
  const applied = Object.entries(filters)
    .filter(([, value]) => value !== undefined)
    .sort(([first], [second]) => first.localeCompare(second))

  return `projects:${JSON.stringify([applied, page, pageSize])}`
}

export const useProjects = (filters: ProjectFilters, pageRequest: PageRequest, service: ProjectService = projectService) => {
  const { data, isLoading, error } = useAsyncData(
    () => service.search(filters, pageRequest),
    toSearchKey(filters, pageRequest),
  )

  return {
    projects: data?.items ?? [],
    total: data?.total ?? 0,
    // La página efectiva puede diferir de la pedida si esta estaba fuera de rango.
    page: data?.page ?? pageRequest.page,
    totalPages: data?.totalPages ?? 1,
    isLoading,
    error,
  }
}
