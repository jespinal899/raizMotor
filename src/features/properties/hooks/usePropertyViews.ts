import { propertyViewService } from '@/features/properties/services/propertyViewService'
import type { PropertyViewService } from '@/features/properties/services/propertyViewService'
import { useAsyncData } from '@/hooks/useAsyncData'

/**
 * Registra la visita a la ficha y devuelve cuántas lleva; `undefined` mientras no se sabe o si no se pudo
 * contar. Que el efecto se repita no infla el total: el servicio cuenta una sola vez por visita.
 */
export const usePropertyViews = (
  propertyId: string,
  service: PropertyViewService = propertyViewService,
): number | undefined => {
  const { data } = useAsyncData(() => service.registerView(propertyId), `property-views:${propertyId}`)

  return data
}
