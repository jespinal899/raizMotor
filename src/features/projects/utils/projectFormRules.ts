import type { ProjectFormValues, ProjectModelValues, ProjectSubmission } from '@/features/projects/types/projectForm.types'
import { MAX_ADDRESS_LENGTH, MAX_NEIGHBORHOOD_LENGTH } from '@/features/properties/utils/publicationValidation'
import { honduranPhone, toInternationalPhone } from '@/shared/utils/honduranPhone'
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
import type { FieldErrors } from '@/shared/utils/validators'

export const MAX_PROJECT_NAME_LENGTH = 100
export const MIN_PROJECT_DESCRIPTION_LENGTH = 20
export const MAX_PROJECT_DESCRIPTION_LENGTH = 4000
export const MAX_PROJECT_MODELS = 20
const MAX_PRICE = 50_000_000

export const EMPTY_MODEL: ProjectModelValues = { name: '', bedrooms: '', bathrooms: '', area: '', priceFrom: '' }

export const EMPTY_PROJECT: ProjectFormValues = {
  department: '',
  city: '',
  neighborhood: '',
  address: '',
  coordinates: null,
  name: '',
  developerName: '',
  developerPhone: '',
  kind: '',
  stage: '',
  deliveryMonth: '',
  priceFrom: '',
  unitsTotal: '',
  description: '',
  models: [EMPTY_MODEL],
  amenities: '',
  images: [],
  videoUrl: '',
}

/** Los campos de cada pantalla del formulario, en orden. */
export const PROJECT_SCREENS: { title: string; description: string; fields: (keyof ProjectFormValues)[] }[] = [
  {
    title: 'Ubicación',
    description: 'Dónde se construye. Al final se confirma el punto en el mapa.',
    fields: ['department', 'city', 'neighborhood', 'address', 'coordinates'],
  },
  {
    title: 'El proyecto',
    description: 'Lo que verán primero quienes lo busquen.',
    fields: ['name', 'developerName', 'developerPhone', 'kind', 'stage', 'deliveryMonth', 'priceFrom', 'unitsTotal', 'description'],
  },
  {
    title: 'Modelos',
    description: 'Los tipos de unidad que se venden, con su área y su precio desde.',
    fields: ['models'],
  },
  {
    title: 'Amenidades y fotos',
    description: 'Lo que comparte todo el proyecto, los renders y las fotos de la obra.',
    fields: ['amenities', 'images', 'videoUrl'],
  },
]

export const ADDRESS_FIELDS: (keyof ProjectFormValues)[] = ['department', 'city', 'neighborhood', 'address']

const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/

const modelError = ({ name, bedrooms, bathrooms, area, priceFrom }: ProjectModelValues) =>
  validate(name, [required('Cada modelo necesita un nombre.'), maxLength(60, 'El nombre del modelo es muy largo.')]) ??
  validate(area, [positiveNumber('Escribe el área de cada modelo en m².')]) ??
  validate(priceFrom, [positiveNumber('Escribe el precio desde de cada modelo, en dólares.'), atMost(MAX_PRICE, 'Revisa el precio de los modelos.')]) ??
  validate(bedrooms, [optional(wholeNumber('Las habitaciones son un número entero.'))]) ??
  validate(bathrooms, [optional(wholeNumber('Los baños son un número entero.'))])

/** Los errores de cada campo, con el mensaje que dice cómo corregirlo. */
export const validateProject = (values: ProjectFormValues): FieldErrors<ProjectFormValues> => ({
  department: validate(values.department, [required('Elige el departamento.')]),
  city: validate(values.city, [required('Elige la ciudad.')]),
  neighborhood: validate(values.neighborhood, [
    required('Escribe la colonia, el barrio o el residencial.'),
    maxLength(MAX_NEIGHBORHOOD_LENGTH, 'La colonia es muy larga.'),
  ]),
  address: validate(values.address, [required('Escribe la dirección.'), maxLength(MAX_ADDRESS_LENGTH, 'La dirección es muy larga.')]),
  coordinates: values.coordinates ? undefined : 'Confirma la ubicación en el mapa.',
  name: validate(values.name, [
    required('Escribe el nombre del proyecto.'),
    minLength(3, 'El nombre necesita al menos 3 caracteres.'),
    maxLength(MAX_PROJECT_NAME_LENGTH, `Usa como máximo ${MAX_PROJECT_NAME_LENGTH} caracteres.`),
  ]),
  developerName: validate(values.developerName, [
    required('Escribe quién desarrolla el proyecto.'),
    minLength(2, 'Escribe el nombre completo de la desarrolladora.'),
    maxLength(100, 'El nombre es muy largo.'),
  ]),
  developerPhone: validate(values.developerPhone, [optional(honduranPhone)]),
  kind: values.kind ? undefined : 'Elige qué tipo de proyecto es.',
  stage: values.stage ? undefined : 'Elige en qué etapa está.',
  deliveryMonth: values.deliveryMonth && !MONTH.test(values.deliveryMonth) ? 'Elige el mes de entrega.' : undefined,
  priceFrom: validate(values.priceFrom, [
    positiveNumber('Escribe el precio de la unidad más barata, en dólares.'),
    atMost(MAX_PRICE, 'Revisa el precio.'),
  ]),
  unitsTotal: validate(values.unitsTotal, [optional(wholeNumber('Las unidades son un número entero.'))]),
  description: validate(values.description, [
    required('Describe el proyecto.'),
    minLength(MIN_PROJECT_DESCRIPTION_LENGTH, `Escribe al menos ${MIN_PROJECT_DESCRIPTION_LENGTH} caracteres.`),
    maxLength(MAX_PROJECT_DESCRIPTION_LENGTH, `Usa como máximo ${MAX_PROJECT_DESCRIPTION_LENGTH} caracteres.`),
  ]),
  models:
    values.models.length > MAX_PROJECT_MODELS
      ? `Como máximo ${MAX_PROJECT_MODELS} modelos.`
      : values.models.map(modelError).find(Boolean),
  amenities: undefined,
  images: values.images.length > 0 ? undefined : 'Agrega al menos una foto: la primera es la portada.',
  videoUrl: values.videoUrl.trim() && !/^https:\/\/\S+$/.test(values.videoUrl.trim()) ? 'Pega el enlace completo del video, empezando por https://.' : undefined,
})

const toOptionalNumber = (value: string) => (value.trim() === '' ? undefined : Number(value))

/** Lo que se guarda, ya validado: números como números, textos sin espacios de más y listas sin líneas vacías. */
export const toProjectSubmission = (values: ProjectFormValues): ProjectSubmission => ({
  department: values.department,
  city: values.city,
  neighborhood: values.neighborhood.trim(),
  address: values.address.trim(),
  coordinates: values.coordinates!,
  name: values.name.trim(),
  developerName: values.developerName.trim(),
  developerPhone: values.developerPhone.trim() ? toInternationalPhone(values.developerPhone) : '',
  kind: values.kind as ProjectSubmission['kind'],
  stage: values.stage as ProjectSubmission['stage'],
  ...(values.deliveryMonth && { deliveryDate: `${values.deliveryMonth}-01` }),
  priceFrom: Number(values.priceFrom),
  ...(values.unitsTotal.trim() && { unitsTotal: Number(values.unitsTotal) }),
  description: values.description.trim(),
  models: values.models.map(({ name, bedrooms, bathrooms, area, priceFrom }) => ({
    name: name.trim(),
    ...(toOptionalNumber(bedrooms) !== undefined && { bedrooms: Number(bedrooms) }),
    ...(toOptionalNumber(bathrooms) !== undefined && { bathrooms: Number(bathrooms) }),
    area: Number(area),
    priceFrom: Number(priceFrom),
  })),
  amenities: values.amenities
    .split('\n')
    .map((amenity) => amenity.trim())
    .filter(Boolean),
  images: values.images,
  ...(values.videoUrl.trim() && { videoUrl: values.videoUrl.trim() }),
})
