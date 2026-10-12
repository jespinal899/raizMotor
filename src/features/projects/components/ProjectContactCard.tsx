import { Building2, MessageCircle, PlayCircle } from 'lucide-react'
import ButtonLink from '@/components/ButtonLink'
import ExternalButtonLink from '@/components/ExternalButtonLink'
import { Card } from '@/components/ui/card'
import type { Project } from '@/features/projects/types/project.types'
import { buildDeveloperChatUrl } from '@/features/projects/utils/projectText'
import { useAbsoluteUrl } from '@/hooks/useAbsoluteUrl'
import { ROUTES, projectDetailPath } from '@/shared/constants/routes'

/** Quién desarrolla el proyecto y cómo escribirle; si no dejó teléfono, se consulta al sitio. */
const ProjectContactCard = ({ project }: { project: Project }) => {
  const { id, name, developer, videoUrl } = project
  const projectUrl = useAbsoluteUrl(projectDetailPath(id))

  return (
    <Card className="gap-4 p-5">
      <div className="flex items-center gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
          <Building2 className="size-5" aria-hidden="true" />
        </span>
        <div className="grid gap-0.5">
          <span className="text-xs text-muted-foreground">Desarrolla</span>
          <span className="font-medium">{developer.name}</span>
        </div>
      </div>

      {developer.phone ? (
        <ExternalButtonLink href={buildDeveloperChatUrl(name, projectUrl, developer.phone)} size="lg" className="h-11 text-base">
          <MessageCircle />
          Pedir información por WhatsApp
        </ExternalButtonLink>
      ) : (
        <ButtonLink to={ROUTES.contact} size="lg" className="h-11 text-base">
          <MessageCircle />
          Pedir información
        </ButtonLink>
      )}

      {videoUrl && (
        <ExternalButtonLink href={videoUrl} variant="outline" size="lg" className="h-11 text-base">
          <PlayCircle />
          Ver el video del proyecto
        </ExternalButtonLink>
      )}
    </Card>
  )
}

export default ProjectContactCard
