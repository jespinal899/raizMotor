import { Eye, Pencil } from 'lucide-react'
import ButtonLink from '@/components/ButtonLink'
import TextLink from '@/components/TextLink'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { PROJECT_STAGES } from '@/features/projects/data/projectOptions.data'
import type { Project } from '@/features/projects/types/project.types'
import DeletePropertyButton from '@/features/properties/components/DeletePropertyButton'
import PropertyPhoto from '@/features/properties/components/PropertyPhoto'
import PublicationStatusButton from '@/features/properties/components/PublicationStatusButton'
import { ROUTES, editProjectPath, projectDetailPath } from '@/shared/constants/routes'

const STATUS_LABELS: Record<NonNullable<Project['status']>, string> = {
  published: 'Publicado',
  draft: 'Despublicado',
  hidden: 'Oculto por el equipo',
}

interface MyProjectCardProps {
  project: Project
  /** Cada una se resuelve cuando el cambio quedó guardado y se rechaza si no se pudo. */
  onUnpublish: () => Promise<void>
  onRepublish: () => Promise<void>
  onRemove: () => Promise<void>
}

/** Un proyecto propio, con lo que se puede hacer con él: verlo, corregirlo, despublicarlo y eliminarlo. */
const MyProjectCard = ({ project, onUnpublish, onRepublish, onRemove }: MyProjectCardProps) => {
  const { id, name, image, stage, district, city, status = 'published' } = project

  return (
    <Card className="gap-0 py-0">
      <div className="relative aspect-4/3 overflow-hidden bg-muted">
        <PropertyPhoto source={image} alt="" loading="lazy" className="size-full object-cover" />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <Badge variant={status === 'published' ? 'default' : 'secondary'}>{STATUS_LABELS[status]}</Badge>
          <Badge variant="outline" className="bg-background">
            {PROJECT_STAGES[stage].label}
          </Badge>
        </div>
      </div>
      <CardContent className="grid gap-4 p-4">
        <div className="grid gap-1">
          <h3 className="font-medium">{name}</h3>
          <p className="text-sm text-muted-foreground">
            {district}, {city}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="col-span-2 grid gap-2">
            {status === 'hidden' ? (
              <p className="text-sm text-muted-foreground">
                Lo ocultó el equipo del sitio. <TextLink to={ROUTES.contact}>Contáctanos</TextLink> si crees que es un error.
              </p>
            ) : (
              <PublicationStatusButton
                action={status === 'published' ? 'unpublish' : 'republish'}
                onAct={status === 'published' ? onUnpublish : onRepublish}
              />
            )}
          </div>
          {status === 'published' && (
            <ButtonLink to={projectDetailPath(id)} variant="outline" className="col-span-2">
              <Eye />
              Ver ficha
            </ButtonLink>
          )}
          <ButtonLink to={editProjectPath(id)} variant="outline">
            <Pencil />
            Editar
          </ButtonLink>
          <DeletePropertyButton title={name} onDelete={onRemove} />
        </div>
      </CardContent>
    </Card>
  )
}

export default MyProjectCard
