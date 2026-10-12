import { projectService } from '@/features/projects/services/projectService'
import type { ProjectService } from '@/features/projects/services/projectService'
import { useAsyncData } from '@/hooks/useAsyncData'

export const useFeaturedProjects = (service: ProjectService = projectService) => {
  const { data, isLoading, error } = useAsyncData(() => service.getFeatured(), 'featured-projects')

  return { projects: data ?? [], isLoading, error }
}
