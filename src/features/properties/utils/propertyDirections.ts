import type { Coordinates } from '@/features/properties/types/property.types'

const GOOGLE_MAPS_DIRECTIONS_URL = 'https://www.google.com/maps/dir/?api=1'

/**
 * Dirección que abre en Google Maps la ruta hasta el punto de la propiedad. No lleva origen: Google usa
 * el lugar desde donde la abre cada persona.
 */
export const buildDirectionsUrl = ({ lat, lng }: Coordinates): string => {
  const directions = new URL(GOOGLE_MAPS_DIRECTIONS_URL)
  directions.searchParams.set('destination', `${lat},${lng}`)

  return directions.href
}
