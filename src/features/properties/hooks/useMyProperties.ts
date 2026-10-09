import { useState } from 'react'
import { propertyService } from '@/features/properties/services/propertyService'
import type { PropertyService } from '@/features/properties/services/propertyService'
import { publicationService } from '@/features/properties/services/publicationService'
import type { PublicationService } from '@/features/properties/services/publicationService'
import type { Property } from '@/features/properties/types/property.types'
import { MAX_FREE_PUBLICATIONS } from '@/features/properties/utils/publicationLimit'
import { useAsyncData } from '@/hooks/useAsyncData'

/** Se leen una vez por visita a la página. */
const OWN_KEY = 'own'

/**
 * Las publicaciones de quien usa el sitio, repartidas entre las que están en el catálogo y las que no,
 * con las que admite su plan y lo que puede hacer con cada una.
 */
export const useMyProperties = (
  properties: PropertyService = propertyService,
  publications: PublicationService = publicationService,
) => {
  const load = async () => {
    const [own, limit] = await Promise.all([properties.getOwn(), publications.getLimit()])

    return { own, limit }
  }
  const { data, isLoading, error } = useAsyncData(load, OWN_KEY)
  const [removed, setRemoved] = useState<string[]>([])
  /** Si quedó en el catálogo cada publicación que se despublicó o se volvió a publicar en esta visita. */
  const [moved, setMoved] = useState<Record<string, boolean>>({})

  // Lo que cambia se refleja sin volver a leer la lista: lo demás sigue igual.
  const withCurrentStatus = (property: Property): Property =>
    Object.hasOwn(moved, property.id)
      ? { ...property, withdrawn: moved[property.id] ? undefined : 'byOwner' }
      : property

  const own = (data?.own ?? []).filter((property) => !removed.includes(property.id)).map(withCurrentStatus)

  /** Cada acción se rechaza si no se pudo guardar; entonces la publicación sigue donde estaba. */
  const moveTo = (id: string, inCatalog: boolean) => setMoved((current) => ({ ...current, [id]: inCatalog }))

  const unpublish = async (id: string) => {
    await publications.unpublish(id)
    moveTo(id, false)
  }

  const republish = async (id: string) => {
    await publications.republish(id)
    moveTo(id, true)
  }

  const remove = async (id: string) => {
    await publications.remove(id)
    setRemoved((ids) => [...ids, id])
  }

  return {
    published: own.filter((property) => !property.withdrawn),
    unpublished: own.filter((property) => property.withdrawn),
    limit: data?.limit ?? MAX_FREE_PUBLICATIONS,
    isLoading,
    error,
    unpublish,
    republish,
    remove,
  }
}
