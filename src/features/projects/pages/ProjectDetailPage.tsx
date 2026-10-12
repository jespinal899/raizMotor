import { SearchX, TriangleAlert } from 'lucide-react'
import { useParams } from 'react-router-dom'
import ButtonLink from '@/components/ButtonLink'
import PageMessage from '@/components/PageMessage'
import ProjectDetail from '@/features/projects/components/ProjectDetail'
import { useProject } from '@/features/projects/hooks/useProject'
import PropertyDetailSkeleton from '@/features/properties/components/PropertyDetailSkeleton'
import { usePageTitle } from '@/hooks/usePageTitle'
import { ROUTES } from '@/shared/constants/routes'

const NOT_FOUND_TITLE = 'Este proyecto ya no está disponible'

const ProjectDetailPage = () => {
  const { id = '' } = useParams()
  const { project, isLoading, error } = useProject(id)
  const isMissing = !isLoading && !error && !project

  usePageTitle(isMissing ? NOT_FOUND_TITLE : project?.name)

  if (error) {
    return (
      <PageMessage icon={TriangleAlert} title="No pudimos cargar el proyecto" description="Inténtalo de nuevo en unos minutos." />
    )
  }

  if (isLoading) return <PropertyDetailSkeleton />

  if (!project) {
    return (
      <PageMessage
        icon={SearchX}
        title={NOT_FOUND_TITLE}
        description="Puede que se haya retirado o que el enlace esté incompleto."
      >
        <ButtonLink to={ROUTES.projects}>Ver todos los proyectos</ButtonLink>
      </PageMessage>
    )
  }

  // La clave reinicia la galería al pasar de un proyecto a otro.
  return <ProjectDetail key={project.id} project={project} />
}

export default ProjectDetailPage
