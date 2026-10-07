import type {
  DetailField,
  PropertyPublication,
  PublicationFormValues,
} from '@/features/properties/types/publication.types'
import { getAmenities, getDetailFields } from '@/features/properties/utils/propertyDetailFields'

/** Convierte un formulario ya validado en la publicación que se envía. */
export const toPublication = (values: PublicationFormValues): PropertyPublication => {
  const { type, operation, coordinates } = values

  if (type === '' || operation === '' || coordinates === null) {
    throw new Error('El formulario debe validarse antes de crear la publicación.')
  }

  // Solo viajan los datos que aplican al tipo elegido, aunque se hubieran escrito otros antes de cambiarlo.
  // Uno en blanco es opcional y no se declara: convertirlo daría un cero que nadie escribió.
  const details: Pick<PropertyPublication, DetailField> = {}
  for (const field of getDetailFields(type)) {
    if (values[field].trim() !== '') details[field] = Number(values[field])
  }

  // Lo mismo con las comodidades, que además salen en el orden en que se ofrecen y no en el que se marcaron.
  const features = getAmenities(type).filter((amenity) => values.features.includes(amenity))

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
    features,
    title: values.title.trim(),
    description: values.description.trim(),
    operation,
    price: Number(values.price),
    images: values.images,
  }
}
