import type { Coordinates, PhotoSource } from '@/features/properties/types/property.types'

/** Qué se construye: casas en una residencial, apartamentos en una torre, un condominio o lotes. */
export type ProjectKind = 'residencial' | 'torre' | 'condominio' | 'lotificacion'

/** En qué punto está: en planos (preventa), en obra, o terminado y listo para entregar. */
export type ProjectStage = 'preventa' | 'construccion' | 'entrega_inmediata'

/** Un modelo de unidad del proyecto: «Modelo A, 2 cuartos, 85 m², desde $95,000». */
export interface ProjectModel {
  name: string
  bedrooms?: number
  bathrooms?: number
  /** En metros cuadrados. */
  area: number
  /** En USD. */
  priceFrom: number
}

export interface ProjectDeveloper {
  name: string
  /** Completo y sin separadores (+50499999999), cuando se le puede escribir. */
  phone?: string
}

/** Un desarrollo que una inmobiliaria vende antes de terminarlo. */
export interface Project {
  id: string
  name: string
  developer: ProjectDeveloper
  description: string
  kind: ProjectKind
  stage: ProjectStage
  /** Fecha estimada de entrega (AAAA-MM-DD), si se anunció. */
  deliveryDate?: string
  /** En USD: el precio de la unidad más barata. */
  priceFrom: number
  unitsTotal?: number
  district: string
  city: string
  department: string
  address?: string
  /** El punto del proyecto en el mapa; los de ejemplo no lo traen. */
  coordinates?: Coordinates
  amenities: string[]
  /** Portada para listados. */
  image: PhotoSource
  /** Renders y fotos de la obra; la primera es la portada. */
  gallery: PhotoSource[]
  videoUrl?: string
  /** Del más barato al más caro. Los listados no los traen: solo la ficha. */
  models: ProjectModel[]
  /** Sale entre los destacados de la portada. */
  featured: boolean
  /** De muestra: no corresponde a ningún proyecto real. */
  example?: boolean
}

/** Lo que se pide en el catálogo de proyectos. */
export interface ProjectFilters {
  kind?: ProjectKind
  stage?: ProjectStage
  /** Colonia o ciudad, sin distinguir mayúsculas ni tildes. */
  location?: string
  maxPrice?: number
}
