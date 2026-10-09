import { Pencil } from 'lucide-react'
import ButtonLink from '@/components/ButtonLink'
import TextLink from '@/components/TextLink'
import DeletePropertyButton from '@/features/properties/components/DeletePropertyButton'
import PublicationStatusButton from '@/features/properties/components/PublicationStatusButton'
import type { Property } from '@/features/properties/types/property.types'
import { ROUTES, editPropertyPath } from '@/shared/constants/routes'

interface PublicationActionsProps {
  property: Property
  /** Cada una se resuelve cuando el cambio quedó guardado y se rechaza si no se pudo. */
  onUnpublish: () => Promise<void>
  onRepublish: () => Promise<void>
  onRemove: () => Promise<void>
}

/**
 * Lo que se puede hacer con una publicación propia: sacarla del catálogo o devolverla a él, corregirla y
 * eliminarla. La que ocultó el equipo del sitio no se vuelve a publicar desde aquí, y lo dice.
 */
const PublicationActions = ({ property, onUnpublish, onRepublish, onRemove }: PublicationActionsProps) => {
  const { id, title, withdrawn } = property

  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="col-span-2 grid gap-2">
        {withdrawn === 'bySite' ? (
          <p className="text-sm text-muted-foreground">
            La ocultó el equipo del sitio. <TextLink to={ROUTES.contact}>Contáctanos</TextLink> si crees que es un
            error.
          </p>
        ) : (
          <PublicationStatusButton
            action={withdrawn ? 'republish' : 'unpublish'}
            onAct={withdrawn ? onRepublish : onUnpublish}
          />
        )}
      </div>
      <ButtonLink to={editPropertyPath(id)} variant="outline">
        <Pencil />
        Editar
      </ButtonLink>
      <DeletePropertyButton title={title} onDelete={onRemove} />
    </div>
  )
}

export default PublicationActions
