import { vi } from 'vitest'
import type { CreateLocationMap, LocationMap } from '@/features/properties/services/locationMap'
import type { Coordinates } from '@/features/properties/types/publication.types'

/** Mapa falso: registra a dónde se le pide mirar y permite simular que la persona lo mueve. */
export const buildFakeLocationMap = () => {
  let reportMove: (center: Coordinates) => void = () => {}

  const map = {
    setView: vi.fn<LocationMap['setView']>(),
    destroy: vi.fn<LocationMap['destroy']>(),
  }

  const createMap = vi.fn<CreateLocationMap>((_container, { onMove }) => {
    reportMove = onMove
    return map
  })

  return { createMap, map, moveTo: (center: Coordinates) => reportMove(center) }
}
