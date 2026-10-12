import { CircleAlert, SearchX } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import BackLink from '@/components/BackLink'
import ButtonLink from '@/components/ButtonLink'
import PageHeader from '@/components/PageHeader'
import PageLoading from '@/components/PageLoading'
import PageMessage from '@/components/PageMessage'
import Container from '@/components/layout/Container'
import ProjectForm from '@/features/projects/components/ProjectForm'
import { myProjectsService } from '@/features/projects/services/myProjectsService'
import type { MyProjectsService } from '@/features/projects/services/myProjectsService'
import { useAsyncData } from '@/hooks/useAsyncData'
import { usePageTitle } from '@/hooks/usePageTitle'
import { ROUTES, projectDetailPath } from '@/shared/constants/routes'

interface ProjectEditorPageProps {
  service?: MyProjectsService | null
}

/**
 * Publicar un proyecto nuevo o, si la dirección trae su identificador, corregir uno propio. Al guardar lleva a
 * la ficha del proyecto.
 */
const ProjectEditorPage = ({ service = myProjectsService }: ProjectEditorPageProps) => {
  const { id } = useParams()
  const navigate = useNavigate()
  const editing = id !== undefined
  const title = editing ? 'Editar proyecto' : 'Publicar un proyecto'
  usePageTitle(title)

  const { data, isLoading, error } = useAsyncData(
    async () => (service && id ? service.getForEdit(id) : undefined),
    `project-editor:${id ?? 'nuevo'}`,
  )

  if (!service) {
    return (
      <PageMessage
        icon={CircleAlert}
        title="Los proyectos aún no están disponibles"
        description="Publicar proyectos necesita las cuentas del sitio, que todavía no están activas."
      />
    )
  }

  if (editing && isLoading) return <PageLoading />

  if (editing && (error || !data)) {
    return (
      <PageMessage
        icon={SearchX}
        title="No encontramos ese proyecto"
        description="Puede que lo hayas eliminado, o que no sea de esta cuenta."
      >
        <ButtonLink to={ROUTES.myProjects}>Ver mis proyectos</ButtonLink>
      </PageMessage>
    )
  }

  return (
    <Container className="grid max-w-4xl gap-8 py-10">
      <BackLink to={ROUTES.myProjects}>Mis proyectos</BackLink>
      <PageHeader
        title={title}
        description="Los interesados lo encuentran en Proyectos y te escriben desde su ficha."
      />
      <ProjectForm
        editing={editing}
        initialValues={data}
        onSubmit={async (project, operationKey) => {
          let savedId = id
          if (savedId) await service.update(savedId, project, operationKey)
          else savedId = await service.create(project, operationKey)
          await navigate(projectDetailPath(savedId))
        }}
      />
    </Container>
  )
}

export default ProjectEditorPage
