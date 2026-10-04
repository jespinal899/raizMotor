import type {
  AddressPrecision,
  AddressQuery,
  Coordinates,
  LocatedAddress,
} from '@/features/properties/types/publication.types'

export interface GeocodingService {
  /**
   * Busca la zona de una dirección. Devuelve `undefined` si no la encuentra
   * y se rechaza si el buscador no responde.
   */
  locate(query: AddressQuery): Promise<LocatedAddress | undefined>
}

interface NominatimOptions {
  fetch?: typeof fetch
  wait?: (milliseconds: number) => Promise<void>
}

const SEARCH_URL = 'https://nominatim.openstreetmap.org/search'
const COUNTRY = 'Honduras'
const COUNTRY_CODE = 'hn'
/** El buscador público de OpenStreetMap admite, como mucho, una consulta por segundo. */
const PAUSE_BETWEEN_SEARCHES = 1000

const pause = (milliseconds: number) => new Promise<void>((resolve) => setTimeout(resolve, milliseconds))

/** La respuesta viene de fuera: solo se acepta si trae dos coordenadas que sean números. */
const toPoint = (results: unknown): Coordinates | undefined => {
  const place: unknown = Array.isArray(results) ? results[0] : undefined
  if (typeof place !== 'object' || place === null) return undefined

  const { lat, lon } = place as Record<string, unknown>
  const point = { lat: Number.parseFloat(String(lat)), lng: Number.parseFloat(String(lon)) }

  return Number.isFinite(point.lat) && Number.isFinite(point.lng) ? point : undefined
}

/** Buscador de direcciones de OpenStreetMap (Nominatim): gratuito, sin clave y pensado para poco tráfico. */
export const createNominatimGeocodingService = ({
  fetch: fetchFn = (...request) => fetch(...request),
  wait = pause,
}: NominatimOptions = {}): GeocodingService => {
  const search = async (text: string): Promise<Coordinates | undefined> => {
    const url = new URL(SEARCH_URL)
    url.search = new URLSearchParams({
      q: text,
      format: 'jsonv2',
      limit: '1',
      countrycodes: COUNTRY_CODE,
      'accept-language': 'es',
    }).toString()

    const response = await fetchFn(url)
    if (!response.ok) throw new Error('El buscador de direcciones no respondió.')

    return toPoint(await response.json())
  }

  return {
    locate: async ({ neighborhood, city, department }) => {
      // De lo más preciso a lo más general. La calle y el número no se envían: el buscador no los conoce en Honduras.
      const attempts: { place: string[]; precision: AddressPrecision }[] = [
        { place: [neighborhood, city, department], precision: 'neighborhood' },
        { place: [city, department], precision: 'city' },
      ]

      for (const [position, { place, precision }] of attempts.entries()) {
        if (position > 0) await wait(PAUSE_BETWEEN_SEARCHES)

        const point = await search([...place, COUNTRY].join(', '))
        if (point) return { point, precision }
      }

      return undefined
    },
  }
}

// Único punto donde se elige el buscador de direcciones: para cambiar de proveedor, se cambia solo esta línea.
export const geocodingService: GeocodingService = createNominatimGeocodingService()
