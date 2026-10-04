import type { DetailField, PublicationFormValues } from '@/features/properties/types/publication.types'
import { isDepartmentId } from '@/features/properties/utils/departments'
import { getDetailFields } from '@/features/properties/utils/propertyDetailFields'
import { maxLength, minLength, positiveNumber, required, validate, wholeNumber } from '@/shared/utils/validators'
import type { FieldErrors, Validator } from '@/shared/utils/validators'

const MIN_ADDRESS_LENGTH = 5
const MIN_TITLE_LENGTH = 10
const MIN_DESCRIPTION_LENGTH = 30
export const MAX_TITLE_LENGTH = 80
export const MAX_DESCRIPTION_LENGTH = 2000

const DETAIL_VALIDATORS: Record<DetailField, Validator[]> = {
  builtArea: [
    required('Indica la superficie construida.'),
    positiveNumber('La superficie construida debe ser mayor que 0.'),
  ],
  landArea: [
    required('Indica la superficie del terreno.'),
    positiveNumber('La superficie del terreno debe ser mayor que 0.'),
  ],
  bedrooms: [required('Indica cuántos cuartos tiene.'), wholeNumber('Los cuartos deben ser un número entero.')],
  bathrooms: [required('Indica cuántos baños tiene.'), wholeNumber('Los baños deben ser un número entero.')],
}

export const validatePublication = (values: PublicationFormValues): FieldErrors<PublicationFormValues> => {
  const requestedDetails = getDetailFields(values.type)

  // Los datos que no aplican al tipo elegido no se muestran, así que tampoco se reclaman.
  const validateDetail = (field: DetailField) =>
    requestedDetails.includes(field) ? validate(values[field], DETAIL_VALIDATORS[field]) : undefined

  return {
    department: isDepartmentId(values.department) ? undefined : 'Selecciona el departamento.',
    city: validate(values.city, [required('Escribe la ciudad.')]),
    neighborhood: validate(values.neighborhood, [required('Escribe la colonia o el barrio.')]),
    address: validate(values.address, [
      required('Escribe la dirección.'),
      minLength(MIN_ADDRESS_LENGTH, 'Añade más detalle a la dirección: calle, bloque o número de casa.'),
    ]),
    coordinates: values.coordinates ? undefined : 'Mueve el mapa hasta dejar el marcador sobre la propiedad.',
    type: values.type ? undefined : 'Selecciona el tipo de propiedad.',
    builtArea: validateDetail('builtArea'),
    landArea: validateDetail('landArea'),
    bedrooms: validateDetail('bedrooms'),
    bathrooms: validateDetail('bathrooms'),
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
    price: validate(values.price, [required('Indica el precio.'), positiveNumber('El precio debe ser mayor que 0.')]),
    images: values.images.length > 0 ? undefined : 'Agrega al menos una foto.',
  }
}
