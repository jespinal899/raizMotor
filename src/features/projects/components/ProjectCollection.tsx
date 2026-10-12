import type { ReactNode } from 'react'
import ProjectCard from '@/features/projects/components/ProjectCard'
import type { Project } from '@/features/projects/types/project.types'
import PropertyListSkeleton from '@/features/properties/components/PropertyListSkeleton'

interface ProjectCollectionProps {
  projects: Project[]
  isLoading: boolean
  error?: Error
  skeletonCount?: number
  emptyState?: ReactNode
}

/** La grilla de proyectos, con su esqueleto mientras cargan y su aviso si no se pudieron leer. */
const ProjectCollection = ({ projects, isLoading, error, skeletonCount, emptyState = null }: ProjectCollectionProps) => {
  if (error) {
    return (
      <p role="alert" className="rounded-2xl border border-dashed px-6 py-12 text-center text-muted-foreground">
        No pudimos cargar los proyectos. Inténtalo de nuevo en unos minutos.
      </p>
    )
  }

  // Las tarjetas de proyecto miden lo mismo que las de propiedad: comparten esqueleto.
  if (isLoading) return <PropertyListSkeleton count={skeletonCount} label="Cargando proyectos" />
  if (projects.length === 0) return emptyState

  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <li key={project.id}>
          <ProjectCard project={project} />
        </li>
      ))}
    </ul>
  )
}

export default ProjectCollection
