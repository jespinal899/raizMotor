import { useState } from 'react'
import { propertyService } from '@/features/properties/services/propertyService'
import type { PropertyService } from '@/features/properties/services/propertyService'
import { publicationService } from '@/features/properties/services/publicationService'
import type { PublicationService } from '@/features/properties/services/publicationService'
import { useAsyncData } from '@/hooks/useAsyncData'

/** Se leen una vez por visita a la página. */
const OWN_KEY = 'own'

/** Los anuncios de quien usa el sitio, y cómo eliminar uno. */
export const useMyProperties = (
  properties: PropertyService = propertyService,
  publications: PublicationService = publicationService,
) => {
  const { data = [], isLoading, error } = useAsyncData(() => properties.getOwn(), OWN_KEY)
  const [removed, setRemoved] = useState<string[]>([])

  /** Se rechaza si no se pudo eliminar; entonces el anuncio sigue en la lista. */
  const remove = async (id: string) => {
    await publications.remove(id)
    // Sale de la lista sin volver a leerla: lo demás no cambió.
    setRemoved((ids) => [...ids, id])
  }

  return { properties: data.filter((property) => !removed.includes(property.id)), isLoading, error, remove }
}
