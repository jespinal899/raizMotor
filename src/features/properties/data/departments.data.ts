import type { Coordinates, MapView } from '@/features/properties/types/publication.types'
import type { SelectOption } from '@/shared/types/common.types'

export interface Department {
  id: string
  name: string
  /** Cabecera departamental: punto de partida del mapa al elegir el departamento. */
  capital: string
  /** Aproximadas: solo sitúan el mapa, el punto exacto lo marca quien publica. */
  capitalCoordinates: Coordinates
}

// Los 18 departamentos de Honduras, en orden alfabético.
export const DEPARTMENTS: Department[] = [
  { id: 'atlantida', name: 'Atlántida', capital: 'La Ceiba', capitalCoordinates: { lat: 15.7792, lng: -86.7931 } },
  { id: 'choluteca', name: 'Choluteca', capital: 'Choluteca', capitalCoordinates: { lat: 13.3007, lng: -87.1908 } },
  { id: 'colon', name: 'Colón', capital: 'Trujillo', capitalCoordinates: { lat: 15.9116, lng: -85.9534 } },
  { id: 'comayagua', name: 'Comayagua', capital: 'Comayagua', capitalCoordinates: { lat: 14.4514, lng: -87.6375 } },
  { id: 'copan', name: 'Copán', capital: 'Santa Rosa de Copán', capitalCoordinates: { lat: 14.767, lng: -88.779 } },
  { id: 'cortes', name: 'Cortés', capital: 'San Pedro Sula', capitalCoordinates: { lat: 15.5042, lng: -88.025 } },
  { id: 'el-paraiso', name: 'El Paraíso', capital: 'Yuscarán', capitalCoordinates: { lat: 13.944, lng: -86.851 } },
  {
    id: 'francisco-morazan',
    name: 'Francisco Morazán',
    capital: 'Tegucigalpa',
    capitalCoordinates: { lat: 14.0723, lng: -87.1921 },
  },
  {
    id: 'gracias-a-dios',
    name: 'Gracias a Dios',
    capital: 'Puerto Lempira',
    capitalCoordinates: { lat: 15.2667, lng: -83.7667 },
  },
  { id: 'intibuca', name: 'Intibucá', capital: 'La Esperanza', capitalCoordinates: { lat: 14.311, lng: -88.18 } },
  {
    id: 'islas-de-la-bahia',
    name: 'Islas de la Bahía',
    capital: 'Roatán',
    capitalCoordinates: { lat: 16.317, lng: -86.537 },
  },
  { id: 'la-paz', name: 'La Paz', capital: 'La Paz', capitalCoordinates: { lat: 14.317, lng: -87.683 } },
  { id: 'lempira', name: 'Lempira', capital: 'Gracias', capitalCoordinates: { lat: 14.59, lng: -88.583 } },
  { id: 'ocotepeque', name: 'Ocotepeque', capital: 'Ocotepeque', capitalCoordinates: { lat: 14.436, lng: -89.183 } },
  { id: 'olancho', name: 'Olancho', capital: 'Juticalpa', capitalCoordinates: { lat: 14.666, lng: -86.219 } },
  {
    id: 'santa-barbara',
    name: 'Santa Bárbara',
    capital: 'Santa Bárbara',
    capitalCoordinates: { lat: 14.919, lng: -88.236 },
  },
  { id: 'valle', name: 'Valle', capital: 'Nacaome', capitalCoordinates: { lat: 13.536, lng: -87.487 } },
  { id: 'yoro', name: 'Yoro', capital: 'Yoro', capitalCoordinates: { lat: 15.138, lng: -87.127 } },
]

export const DEPARTMENT_OPTIONS: SelectOption[] = DEPARTMENTS.map(({ id, name }) => ({ value: id, label: name }))

/** Todo el país, antes de elegir departamento. */
export const COUNTRY_VIEW: MapView = { center: { lat: 14.8, lng: -86.6 }, zoom: 7 }

/** Lo bastante cerca para reconocer barrios y calles principales. */
export const DEPARTMENT_ZOOM = 13
