import type { PublicationFormValues } from '@/features/properties/types/publication.types'

type PublicationField = keyof PublicationFormValues

export interface PublicationStep {
  title: string
  /** Datos que se piden en el paso: son los que se validan antes de dejar avanzar. */
  fields: PublicationField[]
}

/** Datos con los que se busca la dirección en el mapa. */
export const ADDRESS_FIELDS: PublicationField[] = ['department', 'city', 'neighborhood', 'address']

export const PUBLICATION_STEPS: PublicationStep[] = [
  {
    title: 'Propiedad',
    fields: [...ADDRESS_FIELDS, 'coordinates', 'type', 'builtArea', 'landArea', 'bedrooms', 'bathrooms'],
  },
  { title: 'Publicación', fields: ['title', 'description'] },
  { title: 'Últimos detalles', fields: ['operation', 'price', 'images'] },
]
