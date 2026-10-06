import { vi } from 'vitest'
import type { CreateLocationMap, LocationMap } from '@/features/properties/services/locationMap'
import type { Coordinates } from '@/features/properties/types/publication.types'

/** Mapa falso: registra qué punto se le pide mostrar y permite simular que la persona mueve el marcador. */
export const buildFakeLocationMap = () => {
  let reportMove: (point: Coordinates) => void = () => {}

  const map = {
    showPoint: vi.fn<LocationMap['showPoint']>(),
    destroy: vi.fn<LocationMap['destroy']>(),
  }

  const createMap = vi.fn<CreateLocationMap>((_container, { onMarkerMove }) => {
    reportMove = onMarkerMove ?? (() => {})
    return map
  })

  return { createMap, map, moveMarkerTo: (point: Coordinates) => reportMove(point) }
}
