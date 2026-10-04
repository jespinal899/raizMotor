import type {
  DetailField,
  PropertyPublication,
  PublicationFormValues,
} from '@/features/properties/types/publication.types'
import { getDetailFields } from '@/features/properties/utils/propertyDetailFields'

/** Convierte un formulario ya validado en la publicación que se envía. */
export const toPublication = (values: PublicationFormValues): PropertyPublication => {
  const { type, operation, coordinates } = values

  if (type === '' || operation === '' || coordinates === null) {
    throw new Error('El formulario debe validarse antes de crear la publicación.')
  }

  // Solo viajan los datos que aplican al tipo elegido, aunque se hubieran escrito otros antes de cambiarlo.
  const details: Pick<PropertyPublication, DetailField> = {}
  for (const field of getDetailFields(type)) details[field] = Number(values[field])

  return {
    location: {
      department: values.department,
      city: values.city.trim(),
      neighborhood: values.neighborhood.trim(),
      address: values.address.trim(),
      coordinates,
    },
    type,
    ...details,
    title: values.title.trim(),
    description: values.description.trim(),
    operation,
    price: Number(values.price),
    images: values.images,
  }
}
