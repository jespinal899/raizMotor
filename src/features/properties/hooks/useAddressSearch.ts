import { useState } from 'react'
import { geocodingService } from '@/features/properties/services/geocodingService'
import type { GeocodingService } from '@/features/properties/services/geocodingService'
import type { AddressPrecision, MapView, PublicationFormValues } from '@/features/properties/types/publication.types'
import { getDepartmentView, toAddressQuery } from '@/features/properties/utils/departments'

/** Hasta dónde llegó la búsqueda; `department` significa que no se encontró nada más preciso. */
export type ReviewPrecision = AddressPrecision | 'department'

/** Lo que se le enseña a la persona para que confirme o corrija el punto. */
export interface AddressReview {
  view: MapView
  precision: ReviewPrecision
}

export interface AddressSearch {
  status: 'idle' | 'searching' | 'reviewing'
  /** Se conserva al cerrar la revisión, para que la ventana no se vacíe mientras se cierra. */
  review?: AddressReview
}

type AddressLocation = Pick<PublicationFormValues, 'department' | 'city' | 'neighborhood'>

/** Cuanto más precisa es la zona encontrada, más de cerca se muestra. */
const ZOOM_BY_PRECISION: Record<AddressPrecision, number> = { neighborhood: 16, city: 14 }

/** Busca la dirección en el mapa y la deja lista para que la persona la revise y la confirme. */
export const useAddressSearch = (locate: GeocodingService['locate'] = geocodingService.locate) => {
  const [search, setSearch] = useState<AddressSearch>({ status: 'idle' })

  const start = async (location: AddressLocation) => {
    setSearch((current) => ({ ...current, status: 'searching' }))

    // Si el buscador falla se sigue igual que si no hubiera encontrado nada: el punto se marca a mano.
    const located = await locate(toAddressQuery(location)).catch(() => undefined)

    const review: AddressReview = located
      ? { precision: located.precision, view: { center: located.point, zoom: ZOOM_BY_PRECISION[located.precision] } }
      : { precision: 'department', view: getDepartmentView(location.department) }

    setSearch({ status: 'reviewing', review })
  }

  const close = () => setSearch((current) => ({ ...current, status: 'idle' }))

  return { search, start, close }
}
