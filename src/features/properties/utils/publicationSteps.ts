import type { PublicationFormValues } from '@/features/properties/types/publication.types'

type PublicationField = keyof PublicationFormValues

/** Pasos que muestra el indicador del formulario. */
export const PUBLICATION_STEPS = ['Propiedad', 'Publicación', 'Últimos detalles']

export interface PublicationScreen {
  title: string
  description: string
  /** Posición, en `PUBLICATION_STEPS`, del paso al que pertenece la pantalla. */
  step: number
  /** Datos que se piden en la pantalla: son los que se validan antes de dejar avanzar. */
  fields: PublicationField[]
}

/** Datos con los que se busca la dirección en el mapa. */
export const ADDRESS_FIELDS: PublicationField[] = ['department', 'city', 'neighborhood', 'address']

/** Un paso puede repartirse en varias pantallas, para no pedirlo todo a la vez. */
export const PUBLICATION_SCREENS: PublicationScreen[] = [
  {
    title: 'Ubicación',
    description: 'Escribe la dirección y confírmala en el mapa.',
    step: 0,
    fields: [...ADDRESS_FIELDS, 'coordinates'],
  },
  {
    title: 'Tipo de propiedad',
    description: 'Los datos que se piden cambian según el tipo.',
    step: 0,
    fields: ['type', 'builtArea', 'landArea', 'bedrooms', 'bathrooms', 'parking', 'features'],
  },
  {
    title: 'Título y descripción',
    description: 'Lo primero que verán las personas interesadas.',
    step: 1,
    fields: ['title', 'description'],
  },
  {
    title: 'Venta o alquiler',
    description: 'Indica la operación y su precio.',
    step: 2,
    fields: ['operation', 'price'],
  },
  {
    title: 'Fotos',
    description: 'La primera foto será la portada del anuncio.',
    step: 2,
    fields: ['images'],
  },
]
