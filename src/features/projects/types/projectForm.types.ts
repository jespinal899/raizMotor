import type { ProjectKind, ProjectStage } from '@/features/projects/types/project.types'
import type { Coordinates, PublicationPhoto } from '@/features/properties/types/publication.types'

/** Un modelo de unidad tal como se escribe en el formulario: los números siguen siendo texto. */
export interface ProjectModelValues {
  name: string
  bedrooms: string
  bathrooms: string
  area: string
  priceFrom: string
}

/** Lo que se escribe en el formulario de un proyecto. Los números siguen siendo texto hasta que se validan. */
export interface ProjectFormValues {
  department: string
  city: string
  neighborhood: string
  address: string
  /** Punto marcado en el mapa; `null` hasta que la persona lo confirma. */
  coordinates: Coordinates | null
  name: string
  developerName: string
  /** Solo el número local, como lo escribe `PhoneField`; vacío si no se quiere recibir WhatsApp. */
  developerPhone: string
  kind: ProjectKind | ''
  stage: ProjectStage | ''
  /** Mes estimado de entrega (AAAA-MM), o vacío si no se ha anunciado. */
  deliveryMonth: string
  priceFrom: string
  unitsTotal: string
  description: string
  models: ProjectModelValues[]
  /** Una amenidad por línea. */
  amenities: string
  images: PublicationPhoto[]
  videoUrl: string
}

/** Un proyecto listo para guardarse: lo que el formulario entrega una vez validado. */
export interface ProjectSubmission {
  department: string
  city: string
  neighborhood: string
  address: string
  coordinates: Coordinates
  name: string
  developerName: string
  /** Completo (+50499999999), o vacío. */
  developerPhone: string
  kind: ProjectKind
  stage: ProjectStage
  /** Primer día del mes de entrega (AAAA-MM-01), si se anunció. */
  deliveryDate?: string
  priceFrom: number
  unitsTotal?: number
  description: string
  models: { name: string; bedrooms?: number; bathrooms?: number; area: number; priceFrom: number }[]
  amenities: string[]
  images: PublicationPhoto[]
  videoUrl?: string
}

/** Un proyecto propio en «Mis publicaciones»: con su estado, que solo ve su dueño. */
export type OwnProjectStatus = 'published' | 'draft' | 'hidden'
