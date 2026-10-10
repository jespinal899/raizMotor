import type {
  Coordinates,
  DetailField,
  PublicationFormValues,
} from '@/features/properties/types/publication.types'
import { isCityOf, isDepartmentId } from '@/features/properties/utils/departments'
import { getDetailFields } from '@/features/properties/utils/propertyDetailFields'
import {
  atMost,
  maxLength,
  minLength,
  optional,
  positiveNumber,
  required,
  validate,
  wholeNumber,
} from '@/shared/utils/validators'
import type { FieldErrors, Validator } from '@/shared/utils/validators'

// La base de datos exige estos mismos límites al guardar
// (supabase/migrations/20261010000000_integridad_de_anuncios.sql): si cambian aquí, cambian allí.
const MIN_ADDRESS_LENGTH = 5
export const MAX_NEIGHBORHOOD_LENGTH = 120
export const MAX_ADDRESS_LENGTH = 200
const MIN_TITLE_LENGTH = 10
const MIN_DESCRIPTION_LENGTH = 30
export const MAX_TITLE_LENGTH = 80
export const MAX_DESCRIPTION_LENGTH = 2000
/** En dólares: ningún inmueble del país se anuncia por más. */
const MAX_PRICE = 100_000_000
/** En metros cuadrados: diez mil hectáreas. */
const MAX_AREA = 100_000_000
const MAX_ROOMS = 100
/** Un rectángulo que contiene todo Honduras, islas incluidas. */
const HONDURAS_BOUNDS = { minLat: 12.9, maxLat: 17.5, minLng: -89.4, maxLng: -83.0 }

const tooManyRooms = (what: string) => atMost(MAX_ROOMS, `${what} no pueden pasar de ${MAX_ROOMS}.`)

const DETAIL_VALIDATORS: Record<DetailField, Validator[]> = {
  builtArea: [
    required('Indica la superficie construida.'),
    positiveNumber('La superficie construida debe ser mayor que 0.'),
    atMost(MAX_AREA, 'La superficie construida no puede pasar de 100 millones de m².'),
  ],
  landArea: [
    required('Indica la superficie del terreno.'),
    positiveNumber('La superficie del terreno debe ser mayor que 0.'),
    atMost(MAX_AREA, 'La superficie del terreno no puede pasar de 100 millones de m².'),
  ],
  bedrooms: [
    required('Indica cuántos cuartos tiene.'),
    wholeNumber('Los cuartos deben ser un número entero.'),
    tooManyRooms('Los cuartos'),
  ],
  bathrooms: [
    required('Indica cuántos baños tiene.'),
    wholeNumber('Los baños deben ser un número entero.'),
    tooManyRooms('Los baños'),
  ],
  // No todas las propiedades los tienen ni todo el mundo los cuenta: se puede dejar en blanco.
  parking: [
    optional(wholeNumber('Los estacionamientos deben ser un número entero.')),
    tooManyRooms('Los estacionamientos'),
  ],
}

const isInHonduras = ({ lat, lng }: Coordinates) =>
  lat >= HONDURAS_BOUNDS.minLat &&
  lat <= HONDURAS_BOUNDS.maxLat &&
  lng >= HONDURAS_BOUNDS.minLng &&
  lng <= HONDURAS_BOUNDS.maxLng

const validateCoordinates = (coordinates: Coordinates | null) => {
  if (!coordinates) return 'Busca la dirección y confírmala en el mapa.'

  return isInHonduras(coordinates) ? undefined : 'El punto del mapa debe quedar dentro de Honduras.'
}

export const validatePublication = (values: PublicationFormValues): FieldErrors<PublicationFormValues> => {
  const requestedDetails = getDetailFields(values.type)

  // Los datos que no aplican al tipo elegido no se muestran, así que tampoco se reclaman.
  const validateDetail = (field: DetailField) =>
    requestedDetails.includes(field) ? validate(values[field], DETAIL_VALIDATORS[field]) : undefined

  return {
    department: isDepartmentId(values.department) ? undefined : 'Selecciona el departamento.',
    city: isCityOf(values.department, values.city) ? undefined : 'Selecciona la ciudad.',
    neighborhood: validate(values.neighborhood, [
      required('Escribe la colonia, el barrio o la residencial.'),
      maxLength(MAX_NEIGHBORHOOD_LENGTH, `La colonia no puede pasar de ${MAX_NEIGHBORHOOD_LENGTH} caracteres.`),
    ]),
    address: validate(values.address, [
      required('Escribe la dirección.'),
      minLength(MIN_ADDRESS_LENGTH, 'Añade más detalle a la dirección: calle, bloque o número de casa.'),
      maxLength(MAX_ADDRESS_LENGTH, `La dirección no puede pasar de ${MAX_ADDRESS_LENGTH} caracteres.`),
    ]),
    coordinates: validateCoordinates(values.coordinates),
    type: values.type ? undefined : 'Selecciona el tipo de propiedad.',
    builtArea: validateDetail('builtArea'),
    landArea: validateDetail('landArea'),
    bedrooms: validateDetail('bedrooms'),
    bathrooms: validateDetail('bathrooms'),
    parking: validateDetail('parking'),
    title: validate(values.title, [
      required('Escribe un título para el anuncio.'),
      minLength(MIN_TITLE_LENGTH, `El título debe tener al menos ${MIN_TITLE_LENGTH} caracteres.`),
      maxLength(MAX_TITLE_LENGTH, `El título no puede pasar de ${MAX_TITLE_LENGTH} caracteres.`),
    ]),
    description: validate(values.description, [
      required('Describe la propiedad.'),
      minLength(MIN_DESCRIPTION_LENGTH, `Cuenta un poco más: al menos ${MIN_DESCRIPTION_LENGTH} caracteres.`),
      maxLength(MAX_DESCRIPTION_LENGTH, `La descripción no puede pasar de ${MAX_DESCRIPTION_LENGTH} caracteres.`),
    ]),
    operation: values.operation ? undefined : 'Indica si es venta o alquiler.',
    price: validate(values.price, [
      required('Indica el precio.'),
      positiveNumber('El precio debe ser mayor que 0.'),
      atMost(MAX_PRICE, 'El precio no puede pasar de 100 millones de dólares.'),
    ]),
    images: values.images.length > 0 ? undefined : 'Agrega al menos una foto.',
  }
}
