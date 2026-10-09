import type { StoredPublication } from '@/features/properties/services/publishedPropertyRepository'
import type { PublicationFormValues, PublicationPhoto } from '@/features/properties/types/publication.types'

/** Un dato que el anuncio no declara queda en blanco: en el formulario, un cero diría otra cosa. */
const toText = (value: number | undefined) => (value === undefined ? '' : String(value))

const isFormPhoto = (photo: unknown): photo is PublicationPhoto => typeof photo === 'string' || photo instanceof File

/**
 * El formulario tal como quedó al publicar un anuncio, para editarlo. Es el camino de vuelta de
 * `toPublication`: guardar lo que entrega, sin tocar nada, deja el anuncio igual.
 */
export const toFormValues = ({ location, images, ...publication }: StoredPublication): PublicationFormValues => ({
  department: location.department,
  city: location.city,
  neighborhood: location.neighborhood,
  address: location.address,
  // El punto ya se confirmó en el mapa al publicar: no hay que buscar la dirección otra vez.
  coordinates: location.coordinates,
  type: publication.type,
  builtArea: toText(publication.builtArea),
  landArea: toText(publication.landArea),
  bedrooms: toText(publication.bedrooms),
  bathrooms: toText(publication.bathrooms),
  parking: toText(publication.parking),
  features: publication.features ?? [],
  title: publication.title,
  description: publication.description,
  operation: publication.operation,
  price: String(publication.price),
  images: images.filter(isFormPhoto),
})
