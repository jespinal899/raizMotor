import { projectService } from '@/features/projects/services/projectService'
import type { ProjectService } from '@/features/projects/services/projectService'
import { useAsyncData } from '@/hooks/useAsyncData'

export const useProject = (id: string, service: ProjectService = projectService) => {
  const { data, isLoading, error } = useAsyncData(() => service.getById(id), `project:${id}`)

  return { project: data, isLoading, error }
}
