import { useState } from 'react'
import { myProjectsService } from '@/features/projects/services/myProjectsService'
import type { MyProjectsService } from '@/features/projects/services/myProjectsService'
import type { Project } from '@/features/projects/types/project.types'
import { useAsyncData } from '@/hooks/useAsyncData'

/**
 * Los proyectos de la cuenta, con cuántos admite su plan y lo que puede hacer con cada uno. Lo que cambia se
 * refleja sin volver a leer la lista. Cada acción se rechaza si no se pudo guardar; entonces todo sigue igual.
 */
export const useMyProjects = (service: MyProjectsService | null = myProjectsService) => {
  const load = async () => {
    if (!service) return { own: [], limit: 0 }
    const [own, limit] = await Promise.all([service.listOwn(), service.getLimit()])

    return { own, limit }
  }
  const { data, isLoading, error } = useAsyncData(load, 'own-projects')
  const [removed, setRemoved] = useState<string[]>([])
  const [statuses, setStatuses] = useState<Record<string, Project['status']>>({})

  const projects = (data?.own ?? [])
    .filter(({ id }) => !removed.includes(id))
    .map((project) => (Object.hasOwn(statuses, project.id) ? { ...project, status: statuses[project.id] } : project))

  const change = async (id: string, act: (id: string) => Promise<void>, status: Project['status']) => {
    await act(id)
    setStatuses((current) => ({ ...current, [id]: status }))
  }

  return {
    available: service !== null,
    projects,
    published: projects.filter(({ status }) => status === 'published').length,
    limit: data?.limit ?? 0,
    isLoading,
    error,
    unpublish: (id: string) => change(id, service!.unpublish, 'draft'),
    republish: (id: string) => change(id, service!.republish, 'published'),
    remove: async (id: string) => {
      await service!.remove(id)
      setRemoved((ids) => [...ids, id])
    },
  }
}
